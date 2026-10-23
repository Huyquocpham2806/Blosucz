/** Tile effects consume ordered server events and never decide tile behavior. */
import * as THREE from "three";
import { TIMING } from "./timing.js";
export class TileFX {
  constructor(scene, queue) {
    this.scene = scene;
    this.queue = queue;
  }
  async bridge(event) {
    const tiles = this.scene.bridgeMeshes.get(event.bridge_id) || [];
    await Promise.all(
      tiles.flatMap((tile) => {
        tile.traverse((o) => {
          if (o.material) {
            o.material.transparent = true;
          }
        });
        const fades = [];
        tile.traverse((o) => {
          if (o.material)
            fades.push(
              this.queue.tween(o.material, {
                opacity: event.open ? 1 : 0.16,
                duration: TIMING.BRIDGE_S,
              }),
            );
        });
        return [
          this.queue.tween(tile.position, {
            y: event.open ? 0 : -0.65,
            duration: TIMING.BRIDGE_S,
            ease: "power2.inOut",
          }),
          this.queue.tween(tile.scale, {
            x: event.open ? 1 : 0.72,
            y: event.open ? 1 : 0.72,
            z: event.open ? 1 : 0.72,
            duration: TIMING.BRIDGE_S,
          }),
          ...fades,
        ];
      }),
    );
  }
  async press(event) {
    const tile = this.scene.specials.get(event.cell.join(","));
    if (!tile) return;
    await this.queue.tween(tile.position, {
      y: -0.07,
      duration: TIMING.SWITCH_PULSE_S,
      yoyo: true,
      repeat: 1,
    });
  }
  release(mesh) {
    this.scene.resources.delete(mesh.geometry);
    this.scene.resources.delete(mesh.material);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  async fragile(event) {
    const token = this.queue.generation;
    const tile = this.scene.specials.get(event.cell.join(","));
    if (tile) {
      await this.queue.tween(tile.rotation, {
        z: 0.09,
        duration: TIMING.FRAGILE_SHAKE_S,
        yoyo: true,
        repeat: 3,
      });
      if (token !== this.queue.generation) return;
      tile.visible = false;
    }
    const pieces = [];
    for (let i = 0; i < 6; i++) {
      const piece = new THREE.Mesh(
        this.scene.own(new THREE.BoxGeometry(0.24, 0.12, 0.24)),
        this.scene.own(new THREE.MeshStandardMaterial({ color: 0xbd874f })),
      );
      piece.position.set(
        event.cell[1] + ((i % 3) - 1) * 0.27,
        -0.02,
        event.cell[0] + (Math.floor(i / 3) - 0.5) * 0.3,
      );
      this.scene.add(piece);
      pieces.push(piece);
    }
    await Promise.all(
      pieces.map((m, i) =>
        this.queue.tween(m.position, {
          x: m.position.x + (i % 2 ? 0.3 : -0.3),
          y: -3,
          z: m.position.z + 0.3,
          duration: TIMING.FRAGILE_PIECES_S,
          ease: "power2.in",
        }),
      ),
    );
    pieces.forEach((m) => {
      this.scene.root.remove(m);
      this.release(m);
    });
  }
}
