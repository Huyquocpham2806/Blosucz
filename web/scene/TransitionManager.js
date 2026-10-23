/** Staggered tile arrival/collapse. Every tween belongs to AnimationQueue. */
import * as THREE from "three";
import { TIMING } from "./timing.js";
export class TransitionManager {
  constructor(scene, queue) {
    this.scene = scene;
    this.queue = queue;
  }
  async tiles(arriving) {
    const floor = this.scene.floorMesh,
      cells = this.scene.normalCells;
    const start = this.scene.level.grid
      .flatMap((row, r) =>
        [...row].map((ch, c) =>
          this.scene.level.legend[ch] === "start" ? [r, c] : null,
        ),
      )
      .find(Boolean);
    const special = this.scene.tiles.map((mesh) => ({
      mesh,
      y: mesh.position.y,
    }));
    const animation = { t: 0 },
      matrix = new THREE.Matrix4();
    const offset = (r, c) => {
      const delay = Math.min(
        0.4,
        Math.hypot(r - start[0], c - start[1]) * 0.025,
      );
      const p = Math.min(1, Math.max(0, (animation.t - delay) / 0.6));
      return arriving ? 3 * (1 - p) ** 2 : -4 * p * p;
    };
    const update = () => {
      cells.forEach(([r, c], i) => {
        matrix.makeTranslation(c, offset(r, c), r);
        floor.setMatrixAt(i, matrix);
      });
      floor.instanceMatrix.needsUpdate = true;
      special.forEach(({ mesh, y }) => {
        mesh.position.y = y + offset(...mesh.userData.cell);
      });
    };
    update();
    await this.queue.tween(animation, {
      t: 1,
      duration: arriving ? TIMING.INTRO_TILES_S : TIMING.OUTRO_S,
      onUpdate: update,
      ease: "none",
    });
  }
  async intro(block, name) {
    const token = this.queue.generation,
      banner = document.querySelector("#level-banner");
    banner.textContent = name;
    banner.style.opacity = 0;
    block.meshes.forEach((mesh) => (mesh.position.y += 3));
    await Promise.all([
      this.tiles(true),
      this.queue.tween(banner, { opacity: 1, duration: TIMING.INTRO_TITLE_IN_S }),
    ]);
    if (token !== this.queue.generation) return;
    await Promise.all(
      block.meshes.map((mesh) =>
        this.queue.tween(mesh.position, {
          y: mesh.position.y - 3,
          duration: TIMING.INTRO_BLOCK_S,
          ease: "power2.out",
        }),
      ),
    );
    if (token !== this.queue.generation) return;
    await this.queue.tween(banner, { opacity: 0, duration: TIMING.INTRO_TITLE_OUT_S });
  }
  async outro() {
    await this.tiles(false);
  }
}
