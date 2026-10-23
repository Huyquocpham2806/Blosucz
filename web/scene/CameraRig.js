/** Orbit and zoom-enabled orthographic projection with reference lattice default.
 * Screen basis: column=(32,-5), row=(10,16), up on the world is vertical.
 * Fit uses occupied geometry, including closed bridges, with HUD-safe padding.
 * Right-click drag / Shift+drag rotates 360°, scroll wheel zooms, C resets view.
 */
import * as THREE from "three";

const X0 = -10,
  Y0 = Math.sqrt(1124 / 3),
  Z0 = 32;
const R0 = Math.hypot(X0, Y0, Z0);
export const DEFAULT_THETA = Math.atan2(X0, Z0);
export const DEFAULT_PHI = Math.acos(Y0 / R0);

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.center = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.defaultDirection = new THREE.Vector3(X0, Y0, Z0).normalize();
    this.direction = this.defaultDirection.clone();
    this.distance = 60;
    this.theta = DEFAULT_THETA;
    this.phi = DEFAULT_PHI;
  }
  fit(level, aspect) {
    this.theta = DEFAULT_THETA;
    this.phi = DEFAULT_PHI;
    this.direction.copy(this.defaultDirection);
    const cells = [];
    level.grid.forEach((row, r) =>
      [...row].forEach((ch, c) => {
        if (level.legend[ch] !== "void") cells.push([r, c]);
      }),
    );
    const xs = cells.map((c) => c[1]),
      zs = cells.map((c) => c[0]);
    this.center.set(
      (Math.min(...xs) + Math.max(...xs)) / 2,
      0.8,
      (Math.min(...zs) + Math.max(...zs)) / 2,
    );
    const forward = this.direction.clone().negate();
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();
    const bounds = [Infinity, -Infinity, Infinity, -Infinity];
    for (const [r, c] of cells)
      for (const dx of [-0.5, 0.5])
        for (const dz of [-0.5, 0.5])
          for (const y of [-0.35, 2.15]) {
            const v = new THREE.Vector3(c + dx, y, r + dz).sub(this.center);
            const x = v.dot(right),
              py = v.dot(up);
            bounds[0] = Math.min(bounds[0], x);
            bounds[1] = Math.max(bounds[1], x);
            bounds[2] = Math.min(bounds[2], py);
            bounds[3] = Math.max(bounds[3], py);
          }
    this.center
      .addScaledVector(right, (bounds[0] + bounds[1]) / 2)
      .addScaledVector(up, (bounds[2] + bounds[3]) / 2);
    this.target.copy(this.center);
    const halfHeight = Math.max(
      (bounds[3] - bounds[2]) / 1.44,
      (bounds[1] - bounds[0]) / (1.72 * aspect),
      2,
    );
    Object.assign(this.camera, {
      left: -halfHeight * aspect,
      right: halfHeight * aspect,
      top: halfHeight,
      bottom: -halfHeight,
      zoom: 1,
    });
    this.camera.updateProjectionMatrix();
    this.update();
  }
  setAngles(theta, phi) {
    this.theta = theta;
    this.phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, phi));
    this.direction
      .set(
        Math.sin(this.phi) * Math.sin(this.theta),
        Math.cos(this.phi),
        Math.sin(this.phi) * Math.cos(this.theta),
      )
      .normalize();
    this.update();
  }
  reset() {
    this.setAngles(DEFAULT_THETA, DEFAULT_PHI);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }
  toggleOrbitMode() {
    this.orbitMode = !this.orbitMode;
    if (this.dom) {
      this.dom.style.cursor = this.orbitMode ? "grab" : "";
    }
    const btn = document.querySelector("#camera-mode");
    if (btn) {
      btn.classList.toggle("active", this.orbitMode);
      btn.setAttribute("aria-pressed", String(this.orbitMode));
    }
    return this.orbitMode;
  }
  attach(dom) {
    this.dom = dom;
    this.orbitMode = false;
    let isDragging = false;
    let prevX = 0,
      prevY = 0;
    const activeTouches = new Map();
    let initialPinchDistance = 0;
    let initialZoom = 1;

    dom.addEventListener("contextmenu", (e) => e.preventDefault());

    dom.addEventListener("pointerdown", (e) => {
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Rotate with:
      // - orbitMode active (1-finger drag on touchpad or left-click)
      // - Right button (2)
      // - Middle button (1)
      // - Shift or Alt + Left button (0)
      if (
        this.orbitMode ||
        e.button === 2 ||
        e.button === 1 ||
        (e.button === 0 && (e.shiftKey || e.altKey))
      ) {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
        dom.style.cursor = "grabbing";
        dom.setPointerCapture?.(e.pointerId);
      }
    });

    dom.addEventListener("pointermove", (e) => {
      if (activeTouches.has(e.pointerId)) {
        activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Two-finger touch (on touchscreens): rotate and pinch-zoom
      if (activeTouches.size === 2) {
        const [t1, t2] = Array.from(activeTouches.values());
        const currentDist = Math.hypot(t1.x - t2.x, t1.y - t2.y);
        const midX = (t1.x + t2.x) / 2;
        const midY = (t1.y + t2.y) / 2;

        if (initialPinchDistance > 0) {
          const pinchRatio = currentDist / initialPinchDistance;
          this.camera.zoom = Math.max(
            0.4,
            Math.min(3.5, initialZoom * pinchRatio),
          );
          this.camera.updateProjectionMatrix();

          const dx = midX - prevX;
          const dy = midY - prevY;
          this.setAngles(this.theta - dx * 0.007, this.phi - dy * 0.007);
        } else {
          initialPinchDistance = currentDist;
          initialZoom = this.camera.zoom;
        }
        prevX = midX;
        prevY = midY;
        return;
      }

      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      this.setAngles(this.theta - dx * 0.007, this.phi - dy * 0.007);
    });

    const endDrag = (e) => {
      activeTouches.delete(e.pointerId);
      if (activeTouches.size < 2) {
        initialPinchDistance = 0;
      }
      if (isDragging) {
        isDragging = false;
        dom.style.cursor = this.orbitMode ? "grab" : "";
        try {
          dom.releasePointerCapture?.(e.pointerId);
        } catch {}
      }
    };

    dom.addEventListener("pointerup", endDrag);
    dom.addEventListener("pointercancel", endDrag);

    // Touchpad two-finger swipe & pinch, or physical mouse wheel
    dom.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        // 1. Pinch-to-zoom on touchpad (browser sets ctrlKey = true)
        // or user holding Ctrl while scrolling
        if (e.ctrlKey) {
          const factor = Math.exp(-e.deltaY * 0.01);
          this.camera.zoom = Math.max(
            0.4,
            Math.min(3.5, this.camera.zoom * factor),
          );
          this.camera.updateProjectionMatrix();
          return;
        }

        // 2. Physical mouse wheel vs Touchpad detection:
        // Physical mouse wheel usually has deltaMode != 0 (DOM_DELTA_LINE in Firefox)
        // or deltaMode == 0 with deltaX == 0 and large stepped deltaY (>= 100).
        const isPhysicalWheel =
          e.deltaMode !== 0 ||
          (e.deltaX === 0 && Math.abs(e.deltaY) >= 100 && e.deltaY % 20 === 0);

        if (isPhysicalWheel && !e.shiftKey) {
          // Standard physical mouse wheel: Zoom
          const factor = e.deltaY < 0 ? 1.1 : 0.91;
          this.camera.zoom = Math.max(
            0.4,
            Math.min(3.5, this.camera.zoom * factor),
          );
          this.camera.updateProjectionMatrix();
        } else {
          // Touchpad two-finger swipe (or Shift + wheel): Rotate 360°!
          // deltaX rotates horizontally (theta), deltaY tilts vertically (phi)
          this.setAngles(
            this.theta - e.deltaX * 0.005,
            this.phi - e.deltaY * 0.005,
          );
        }
      },
      { passive: false },
    );

    // Double-click with right/middle button or shift to reset
    dom.addEventListener("dblclick", (e) => {
      if (e.button === 2 || e.button === 1 || e.shiftKey) {
        this.reset();
      }
    });

    // Button click & keyboard shortcuts
    const camBtn = document.querySelector("#camera-mode");
    if (camBtn) {
      camBtn.addEventListener("click", () => this.toggleOrbitMode());
    }

    window.addEventListener("keydown", (e) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "SELECT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      if (e.key === "c" || e.key === "C") {
        this.reset();
      } else if (e.key === "v" || e.key === "V") {
        this.toggleOrbitMode();
      }
    });
  }
  update() {
    this.camera.position
      .copy(this.target)
      .addScaledVector(this.direction, this.distance);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }
  shake() {} // Fixed reference view; effects do not move the coordinate frame.
}
