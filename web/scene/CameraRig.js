/** Fixed orthographic projection derived from the reference's tile lattice.
 * Screen basis: column=(32,-5), row=(10,16), up on the world is vertical.
 * Fit uses occupied geometry, including closed bridges, with HUD-safe padding.
 */
import * as THREE from "three";
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.center = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.direction = new THREE.Vector3(-10, Math.sqrt(1124 / 3), 32).normalize();
    this.distance = 60;
  }
  fit(level, aspect) {
    const cells = [];
    level.grid.forEach((row, r) => [...row].forEach((ch, c) => {
      if (level.legend[ch] !== "void") cells.push([r, c]);
    }));
    const xs = cells.map(c => c[1]), zs = cells.map(c => c[0]);
    this.center.set((Math.min(...xs) + Math.max(...xs)) / 2, 0.8,
                    (Math.min(...zs) + Math.max(...zs)) / 2);
    const forward = this.direction.clone().negate();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();
    const bounds = [Infinity, -Infinity, Infinity, -Infinity];
    for (const [r, c] of cells) for (const dx of [-0.5, 0.5])
      for (const dz of [-0.5, 0.5]) for (const y of [-0.35, 2.15]) {
        const v = new THREE.Vector3(c + dx, y, r + dz).sub(this.center);
        const x = v.dot(right), py = v.dot(up);
        bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.max(bounds[1], x);
        bounds[2] = Math.min(bounds[2], py); bounds[3] = Math.max(bounds[3], py);
      }
    this.center.addScaledVector(right, (bounds[0] + bounds[1]) / 2)
               .addScaledVector(up, (bounds[2] + bounds[3]) / 2);
    this.target.copy(this.center);
    const halfHeight = Math.max((bounds[3] - bounds[2]) / 1.44,
                               (bounds[1] - bounds[0]) / (1.72 * aspect), 2);
    Object.assign(this.camera, {left: -halfHeight * aspect, right: halfHeight * aspect,
                               top: halfHeight, bottom: -halfHeight, zoom: 1});
    this.camera.updateProjectionMatrix();
    this.update();
  }
  update() {
    this.camera.position.copy(this.target).addScaledVector(this.direction, this.distance);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }
  shake() {} // Fixed reference view; effects do not move the coordinate frame.
}
