/** Event-driven rigid-body animation. poseFromState is the only state-to-pose mapping. */
import * as THREE from "three";
import { TIMING } from "./timing.js";
export function poseFromState(state) {
  if (!state) return [];
  if (state.orientation === "split")
    return state.cubes.map(([r, c]) => ({
      position: [c, 0.5, r],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }));
  const cells = state.cubes;
  const x = cells.reduce((s, c) => s + c[1], 0) / cells.length,
    z = cells.reduce((s, c) => s + c[0], 0) / cells.length;
  return [
    {
      position: [x, state.orientation === "standing" ? 1 : 0.5, z],
      rotation:
        state.orientation === "lying_h"
          ? [0, 0, Math.PI / 2]
          : state.orientation === "lying_v"
            ? [Math.PI / 2, 0, 0]
            : [0, 0, 0],
      scale: [1, 1, 1],
    },
  ];
}
function metalTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#544a42";
  ctx.fillRect(0, 0, 128, 128);
  let seed = 413;
  for (let i = 0; i < 2400; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 128, y = Math.floor(seed / 128) % 128;
    ctx.fillStyle = ["#905438", "#a4603e", "#746a63", "#383634"][i % 4];
    ctx.globalAlpha = 0.16;
    ctx.fillRect(x, y, 2 + seed % 9, 2 + seed % 7);
  }
  ctx.globalAlpha = 1;
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
export class BlockAnimator {
  constructor(scene, queue) {
    this.scene = scene;
    this.queue = queue;
    this.meshes = [];
    this.group = new THREE.Group();
    scene.add(this.group);
    this.marker = null;
    this.owned = new Set();
  }
  own(resource) {
    this.owned.add(resource);
    return this.scene.own(resource);
  }
  create(split) {
    this.group.clear();
    for (const resource of this.owned) {
      this.scene.resources.delete(resource);
      resource.dispose?.();
    }
    this.owned.clear();
    this.meshes = [];
    const geo = this.own(
      new THREE.BoxGeometry(0.98, split ? 0.98 : 1.96, 0.98),
    );
    const map = this.own(metalTexture());
    for (let i = 0; i < (split ? 2 : 1); i++) {
      const mat = this.own(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map,
          roughness: 0.72,
          metalness: 0.18,
          transparent: true,
        }),
      );
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.meshes.push(mesh);
      const edges = new THREE.LineSegments(
        this.own(new THREE.EdgesGeometry(geo)),
        this.own(
          new THREE.LineBasicMaterial({
            color: 0x3b3029,
            transparent: true,
            opacity: 0.7,
          }),
        ),
      );
      mesh.add(edges);
      if (!split) {
        const stripe = new THREE.Mesh(
          this.own(new THREE.BoxGeometry(0.987, 0.025, 0.987)),
          this.own(
            new THREE.MeshStandardMaterial({
              color: 0x44342b,
              roughness: 0.5,
              metalness: 0.4,
            }),
          ),
        );
        mesh.add(stripe);
      }
    }
    if (split) {
      this.marker = new THREE.Mesh(
        this.own(new THREE.ConeGeometry(0.12, 0.23, 4)),
        this.own(new THREE.MeshBasicMaterial({ color: 0xa5fff0 })),
      );
      this.marker.rotation.z = Math.PI;
      this.marker.visible = false;
      this.group.add(this.marker);
    } else this.marker = null;
    this.split = split;
  }
  snap(state) {
    if (!state) return;
    const poses = poseFromState(state);
    if (this.split !== state.split || this.meshes.length !== poses.length)
      this.create(state.split);
    poses.forEach((pose, i) => {
      const mesh = this.meshes[i];
      this.group.attach(mesh);
      mesh.position.fromArray(pose.position);
      mesh.rotation.set(...pose.rotation);
      mesh.scale.set(1, 1, 1);
      mesh.material.opacity = 1;
      mesh.visible = true;
    });
    if (this.marker) {
      this.marker.visible = true;
      this.marker.position.copy(this.meshes[state.active].position);
      this.marker.position.y = 1.4;
      this.meshes.forEach((m, i) => {
        m.material.emissive.setHex(i === state.active ? 0x28675c : 0x000000);
        m.material.emissiveIntensity = 0.35;
      });
    }
    this.state = state;
  }
  center() {
    if (!this.meshes.length) return null;
    return this.meshes[this.state?.split ? this.state.active : 0].position;
  }
  async roll(event) {
    const index = event.cube_index ?? 0;
    const mesh = this.meshes[index];
    if (!mesh) return;
    const cells =
      event.cube_index === null ? event.from_cells : [event.from_cells[index]];
    const minR = Math.min(...cells.map((c) => c[0])),
      maxR = Math.max(...cells.map((c) => c[0]));
    const minC = Math.min(...cells.map((c) => c[1])),
      maxC = Math.max(...cells.map((c) => c[1]));
    const pivot = new THREE.Group();
    const d = event.direction;
    const horizontal = d === "LEFT" || d === "RIGHT";
    pivot.position.set(
      horizontal ? (d === "LEFT" ? minC - 0.5 : maxC + 0.5) : (minC + maxC) / 2,
      0,
      horizontal ? (minR + maxR) / 2 : d === "UP" ? minR - 0.5 : maxR + 0.5,
    );
    this.group.add(pivot);
    pivot.attach(mesh);
    if (this.marker) this.marker.visible = false;
    const ok = await this.queue.tween(pivot.rotation, {
      [horizontal ? "z" : "x"]: horizontal
        ? d === "LEFT"
          ? Math.PI / 2
          : -Math.PI / 2
        : d === "UP"
          ? -Math.PI / 2
          : Math.PI / 2,
      duration: TIMING.ROLL_S,
      ease: "power2.inOut",
    });
    if (!ok) return;
    this.group.attach(mesh);
    this.group.remove(pivot);
    // Destination event carries display orientation; no movement rules are inferred here.
    const display = {
      cubes: event.to_cells,
      orientation: event.to_orientation,
      split: event.to_orientation === "split",
      active: index,
    };
    const poses = poseFromState(display);
    const pose = poses[index];
    mesh.position.fromArray(pose.position);
    mesh.rotation.set(...pose.rotation);
    mesh.scale.set(1, 1, 1);
    if (this.marker) this.marker.visible = true;

  }
  async splitEvent(event) {
    const origin = this.meshes[0].position.clone();
    this.create(true);
    this.meshes.forEach((m) => m.position.copy(origin));
    await Promise.all(
      this.meshes.map((m, i) =>
        this.queue.tween(m.position, {
          x: event.to_cells[i][1],
          y: 0.5,
          z: event.to_cells[i][0],
          duration: TIMING.SPLIT_S,
          ease: "power2.inOut",
        }),
      ),
    );
  }
  async mergeEvent(event) {
    const state = {
      cubes: event.cells,
      orientation: event.orientation,
      split: false,
      active: 0,
    };
    this.snap(state);
    await this.queue.tween(this.meshes[0].scale, {
      x: 1.05,
      z: 1.05,
      duration: TIMING.MERGE_PULSE_S,
      repeat: 1,
      yoyo: true,
    });
  }
  async swapEvent(event) {
    if (this.marker) {
      const [r, c] = event.cells[event.active];
      await this.queue.tween(this.marker.position, {
        x: c,
        z: r,
        y: 1.4,
        duration: TIMING.SWAP_S,
      });
    }
  }
  async fall() {
    this.scene.rig.shake();
    const fades = [];
    // Child seams/edges must disappear with the body, including both split cubes.
    for (const mesh of this.meshes) mesh.traverse((part) => {
      if (!part.material) return;
      part.material.transparent = true;
      fades.push(this.queue.tween(part.material, {opacity: 0, duration: TIMING.FALL_S}));
    });
    if (this.marker) this.marker.visible = false;
    await Promise.all(
      [...fades, ...this.meshes.flatMap((m) => [
        this.queue.tween(m.position, {
          y: -5,
          duration: TIMING.FALL_S,
          ease: "power2.in",
        }),
        this.queue.tween(m.rotation, { z: m.rotation.z + 0.8, duration: TIMING.FALL_S }),
      ])],
    );
    this.meshes.forEach((mesh) => (mesh.visible = false));
  }
  async win() {
    this.scene.rig.shake();
    // The hole hides the part below the underside of the board while sinking.
    this.scene.renderer.localClippingEnabled = true;
    for (const mesh of this.meshes) mesh.traverse((part) => {
      if (!part.material) return;
      part.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.35)];
    });
    await Promise.all(
      this.meshes.map((m) =>
        this.queue.tween(m.position, {
          y: -2.2,
          duration: TIMING.SINK_S,
          ease: "power2.inOut",
        }),
      ),
    );
    this.meshes.forEach((mesh) => (mesh.visible = false));
  }
  check(state) {
    if (!state) return true;
    const poses = poseFromState(state);
    return poses.every(
      (p, i) =>
        this.meshes[i] &&
        this.meshes[i].position.distanceTo(new THREE.Vector3(...p.position)) <
          1e-5 &&
        this.meshes[i].quaternion.angleTo(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),
        ) < 1e-5 &&
        this.meshes[i].scale.distanceTo(new THREE.Vector3(...p.scale)) < 1e-5,
    );
  }
}
