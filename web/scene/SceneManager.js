/** Procedural board renderer. Owns and disposes every level resource; no game rules. */
import * as THREE from "three";
import { CameraRig } from "./CameraRig.js";
export const COLORS = {
  floor: 0xa0a3a7,
  start: 0xa0a3a7,
  fragile: 0xd98236,
  bridge: 0x74716a,
  soft_switch: 0x93979b,
  heavy_switch: 0x8a8e94,
  split_switch: 0x8e989d,
  goal: 0x817c70,
};
export function stoneGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.44, -0.44);
  shape.lineTo(0.44, -0.44);
  shape.lineTo(0.44, 0.44);
  shape.lineTo(-0.44, 0.44);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.23,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.265, 0);
  return geo;
}
function texture(kind, debugLabel = "") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const c = canvas.getContext("2d");
  c.fillStyle = "#ffffff";
  let seed = 17;
  for (let i = 0; i < 170; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 128;
    seed = (seed * 16807) % 2147483647;
    c.globalAlpha = 0.015 + (seed % 5) / 200;
    c.fillRect(x, seed % 128, 2, 2);
  }
  c.globalAlpha = 1;
  c.strokeStyle = kind === "fragile" ? "#392c25" : "#302a25";
  c.lineWidth = 6;
  c.lineCap = "round";
  c.fillStyle = "#302a25";
  if (kind === "soft_switch") {
    c.beginPath();
    for (let i = 0; i <= 8; i++) {
      const a = i * Math.PI / 4 + Math.PI / 8;
      const x = 64 + 30 * Math.cos(a), y = 64 + 30 * Math.sin(a);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    c.beginPath();
    c.arc(64, 64, 8, 0, Math.PI * 2);
    c.fill();
  }
  if (kind === "heavy_switch") {
    c.beginPath();
    c.moveTo(40, 40);
    c.lineTo(88, 88);
    c.moveTo(40, 88);
    c.lineTo(88, 40);
    c.stroke();
  }
  if (kind === "split_switch") {
    c.font = "bold 65px sans-serif";
    c.textAlign = "center";
    c.fillText("( )", 64, 85);
  }
  if (kind === "start") {
    c.globalAlpha = 0.4;
    c.strokeRect(49, 49, 30, 30);
    c.globalAlpha = 1;
  }
  if (kind === "fragile") {
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(20, 0);
    c.lineTo(42, 40);
    c.lineTo(72, 54);
    c.lineTo(61, 86);
    c.lineTo(91, 128);
    c.moveTo(72, 54);
    c.lineTo(119, 26);
    c.stroke();
  }
  if (debugLabel) {
    c.font = "22px monospace";
    c.textAlign = "center";
    c.fillStyle = "#ffffff";
    c.fillText(debugLabel, 64, 116);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function auraTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, color.replace("0.5)", "0.2)"));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stoneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d0d0ce"; ctx.fillRect(0, 0, 128, 128);
  let seed = 101;
  for (let i = 0; i < 1400; i++) {
    seed = (seed * 16807) % 2147483647;
    ctx.fillStyle = i % 2 ? "#7d8083" : "#ecece6";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(seed % 128, Math.floor(seed / 128) % 128, 3 + seed % 11, 3);
  }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
export class SceneManager {
  constructor(container, queue, debug = false) {
    this.container = container;
    this.queue = queue;
    this.debug = debug;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x170800, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.prepend(this.renderer.domElement);
    this.camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 200);
    this.rig = new CameraRig(this.camera);
    this.rig.attach(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x302d2a, 2.0));
    const light = new THREE.DirectionalLight(0xffffff, 3.2);
    light.position.set(-5, 16, 8);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    Object.assign(light.shadow.camera, {
      left: -28,
      right: 28,
      top: 28,
      bottom: -28,
      near: 0.1,
      far: 70,
    });
    light.shadow.bias = -0.0006;
    light.shadow.normalBias = 0.025;
    this.scene.add(light);
    this.light = light;
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.resources = new Set();
    this.bridgeMeshes = new Map();
    this.specials = new Map();
    this.fps = 0;
    this.last = performance.now();
    this.hidden = false;
    new ResizeObserver(() => this.resize()).observe(container);
    document.addEventListener("visibilitychange", () => {
      this.hidden = document.hidden;
      this.queue.visibility(this.hidden);
      this.last = performance.now();
    });
    this.renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      document.querySelector("#context-error").hidden = false;
    });
    this.renderer.setAnimationLoop((now) => {
      if (this.hidden) return;
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      this.fps = this.fps * 0.94 + (1 / Math.max(dt, 0.001)) * 0.06;
      this.rig.update(this.follow?.(), dt);
      this.renderer.render(this.scene, this.camera);
      this.onFrame?.();
    });
  }
  own(resource) {
    this.resources.add(resource);
    return resource;
  }
  add(mesh) {
    this.root.add(mesh);
    return mesh;
  }
  clear() {
    this.root.clear();
    for (const r of this.resources) r.dispose?.();
    this.resources.clear();
    this.bridgeMeshes.clear();
    this.specials.clear();
    this.renderer.renderLists.dispose();
  }
  material(kind) {
    const options = {
      color: COLORS[kind] ?? COLORS.floor,
      map: this.stoneMap,
      roughness: 0.9,
      metalness: 0.12,
    };
    return this.own(new THREE.MeshStandardMaterial(options));
  }
  build(level, state) {
    this.clear();
    this.level = level;
    this.light.intensity = 3.2;
    this.tiles = [];
    this.stoneMap = this.own(stoneTexture());
    const normal = [];
    const geo = this.own(stoneGeometry());

    // Reusable 3D Switch Assets (disposed cleanly via this.own on level clear)
    const softBezelGeo = this.own(new THREE.CylinderGeometry(0.36, 0.38, 0.05, 24));
    const softBezelMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x4a433d,
        metalness: 0.7,
        roughness: 0.35,
      }),
    );
    const softBtnGeo = this.own(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 24));
    const softBtnMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0xe9a643,
        emissive: 0x5a3410,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.25,
      }),
    );
    const softDotGeo = this.own(new THREE.CylinderGeometry(0.09, 0.09, 0.10, 16));
    const softDotMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0xffd277,
        emissive: 0x664411,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
      }),
    );
    const softAuraGeo = this.own(new THREE.PlaneGeometry(0.96, 0.96));
    const softAuraMat = this.own(
      new THREE.MeshBasicMaterial({
        map: this.own(auraTexture("rgba(233, 166, 67, 0.5)")),
        transparent: true,
        depthWrite: false,
      }),
    );

    const heavyBaseGeo = this.own(new THREE.BoxGeometry(0.70, 0.03, 0.70));
    const heavyBaseMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x3a3f45,
        metalness: 0.6,
        roughness: 0.4,
      }),
    );
    const heavyBarGeo = this.own(new THREE.BoxGeometry(0.58, 0.08, 0.15));
    const heavyBarMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0xcfd4da,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x181c20,
      }),
    );

    const splitBaseGeo = this.own(new THREE.CylinderGeometry(0.38, 0.40, 0.03, 24));
    const splitBaseMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x363d44,
        metalness: 0.6,
        roughness: 0.4,
      }),
    );
    const splitArcGeo = this.own(new THREE.TorusGeometry(0.22, 0.04, 12, 24, Math.PI * 0.7));
    const splitArcMat = this.own(
      new THREE.MeshStandardMaterial({
        color: 0x65dcd0,
        emissive: 0x1b5550,
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.2,
      }),
    );

    for (let r = 0; r < level.grid.length; r++)
      for (let c = 0; c < level.grid[r].length; c++) {
        const kind = level.legend[level.grid[r][c]];
        if (kind === "void") continue;
        if (kind === "floor") {
          normal.push([r, c]);
          continue;
        }
        const group = new THREE.Group();
        group.position.set(c, 0, r);
        group.userData.cell = [r, c];
        this.add(group);
        this.tiles.push(group);
        if (kind === "goal") {
          const mat = this.own(
            new THREE.MeshStandardMaterial({
              color: 0x817c70,
              emissive: 0x000000,
              emissiveIntensity: 0,
              metalness: 0.3,
              roughness: 0.3,
            }),
          );
          for (const [x, z, w, d] of [
            [0, -0.45, 0.98, 0.08],
            [0, 0.45, 0.98, 0.08],
            [-0.45, 0, 0.08, 0.82],
            [0.45, 0, 0.08, 0.82],
          ]) {
            const m = new THREE.Mesh(
              this.own(new THREE.BoxGeometry(w, 0.1, d)),
              mat,
            );
            m.position.set(x, -0.02, z);
            group.add(m);
          }
          const pit = new THREE.Mesh(
            this.own(new THREE.BoxGeometry(0.86, 0.12, 0.86)),
            this.own(new THREE.MeshStandardMaterial({ color: 0x07121b })),
          );
          pit.position.y = -0.34;
          group.add(pit);
          const walls = new THREE.Mesh(
            this.own(new THREE.BoxGeometry(0.87, 0.3, 0.87)),
            this.own(
              new THREE.MeshStandardMaterial({
                color: 0x282420,
                side: THREE.BackSide,
              }),
            ),
          );
          walls.position.y = -0.15;
          group.add(walls);
        } else if (kind === "soft_switch") {
          const mesh = new THREE.Mesh(geo, this.material(kind));
          mesh.castShadow = mesh.receiveShadow = true;
          group.add(mesh);

          const aura = new THREE.Mesh(softAuraGeo, softAuraMat);
          aura.rotation.x = -Math.PI / 2;
          aura.position.y = 0.005;
          group.add(aura);

          const bezel = new THREE.Mesh(softBezelGeo, softBezelMat);
          bezel.position.y = 0.025;
          bezel.castShadow = bezel.receiveShadow = true;
          group.add(bezel);

          const btn = new THREE.Mesh(softBtnGeo, softBtnMat);
          btn.position.y = 0.05;
          btn.castShadow = btn.receiveShadow = true;
          group.add(btn);

          const dot = new THREE.Mesh(softDotGeo, softDotMat);
          dot.position.y = 0.06;
          dot.castShadow = true;
          group.add(dot);
        } else if (kind === "heavy_switch") {
          const mesh = new THREE.Mesh(geo, this.material(kind));
          mesh.castShadow = mesh.receiveShadow = true;
          group.add(mesh);

          const base = new THREE.Mesh(heavyBaseGeo, heavyBaseMat);
          base.position.y = 0.015;
          base.castShadow = base.receiveShadow = true;
          group.add(base);

          const bar1 = new THREE.Mesh(heavyBarGeo, heavyBarMat);
          bar1.position.y = 0.045;
          bar1.rotation.y = Math.PI / 4;
          bar1.castShadow = bar1.receiveShadow = true;
          group.add(bar1);

          const bar2 = new THREE.Mesh(heavyBarGeo, heavyBarMat);
          bar2.position.y = 0.045;
          bar2.rotation.y = -Math.PI / 4;
          bar2.castShadow = bar2.receiveShadow = true;
          group.add(bar2);
        } else if (kind === "split_switch") {
          const mesh = new THREE.Mesh(geo, this.material(kind));
          mesh.castShadow = mesh.receiveShadow = true;
          group.add(mesh);

          const base = new THREE.Mesh(splitBaseGeo, splitBaseMat);
          base.position.y = 0.015;
          base.castShadow = base.receiveShadow = true;
          group.add(base);

          const leftArc = new THREE.Mesh(splitArcGeo, splitArcMat);
          leftArc.rotation.x = -Math.PI / 2;
          leftArc.rotation.z = Math.PI * 0.65;
          leftArc.position.set(-0.06, 0.045, 0);
          leftArc.castShadow = leftArc.receiveShadow = true;
          group.add(leftArc);

          const rightArc = new THREE.Mesh(splitArcGeo, splitArcMat);
          rightArc.rotation.x = -Math.PI / 2;
          rightArc.rotation.z = -Math.PI * 0.35;
          rightArc.position.set(0.06, 0.045, 0);
          rightArc.castShadow = rightArc.receiveShadow = true;
          group.add(rightArc);
        } else {
          const mesh = new THREE.Mesh(geo, this.material(kind));
          mesh.castShadow = mesh.receiveShadow = true;
          group.add(mesh);
          const symbol = new THREE.Mesh(
            this.own(new THREE.PlaneGeometry(0.87, 0.87)),
            this.own(
              new THREE.MeshBasicMaterial({
                map: this.own(texture(kind)),
                transparent: true,
                depthWrite: false,
              }),
            ),
          );
          symbol.rotation.x = -Math.PI / 2;
          symbol.position.y = 0.008;
          group.add(symbol);
        }
        this.specials.set(`${r},${c}`, group);
        if (kind === "bridge") {
          const bridge = level.bridges.find((b) =>
            b.cells.some((cell) => cell[0] === r && cell[1] === c),
          );
          if (!this.bridgeMeshes.has(bridge.id))
            this.bridgeMeshes.set(bridge.id, []);
          this.bridgeMeshes.get(bridge.id).push(group);
        }
      }
    const instanced = new THREE.InstancedMesh(
      geo,
      this.material("floor"),
      normal.length,
    );
    instanced.castShadow = instanced.receiveShadow = true;
    this.add(instanced);
    this.own(instanced);
    const matrix = new THREE.Matrix4();
    normal.forEach(([r, c], i) =>
      instanced.setMatrixAt(i, matrix.makeTranslation(c, 0, r)),
    );
    instanced.instanceMatrix.needsUpdate = true;
    this.floorMesh = instanced;
    this.normalCells = normal;
    if (this.debug) {
      for (let r = 0; r < level.grid.length; r++)
        for (let c = 0; c < level.grid[r].length; c++) {
          if (level.legend[level.grid[r][c]] === "void") continue;
          const label = new THREE.Mesh(
            this.own(new THREE.PlaneGeometry(0.87, 0.87)),
            this.own(
              new THREE.MeshBasicMaterial({
                map: this.own(texture("", `${r},${c}`)),
                transparent: true,
                depthWrite: false,
              }),
            ),
          );
          label.rotation.x = -Math.PI / 2;
          label.position.set(c, 0.015, r);
          this.add(label);
        }
    }
    // A translucent receiving plane grounds the suspended board without external assets.
    const shadow = new THREE.Mesh(
      this.own(new THREE.PlaneGeometry(100, 100)),
      this.own(new THREE.ShadowMaterial({ opacity: 0.16 })),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.5;
    shadow.receiveShadow = true;
    this.add(shadow);
    this.syncBridges(state);
    this.resize();
    this.light.target.position.copy(this.rig.center);
    this.scene.add(this.light.target);
    this.light.position.copy(this.rig.center).add(new THREE.Vector3(-5, 16, 8));
  }
  syncBridges(state) {
    for (const [id, meshes] of this.bridgeMeshes) {
      const open = state.bridges_open.includes(id);
      for (const mesh of meshes) {
        mesh.visible = true;
        mesh.position.y = open ? 0 : -0.65;
        mesh.scale.setScalar(open ? 1 : 0.72);
        mesh.traverse((o) => {
          if (o.material) {
            o.material.transparent = !open || Boolean(o.material.map);
            o.material.opacity = open ? 1 : 0.16;
          }
        });
      }
    }
  }
  resize() {
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    if (this.level)
      this.rig.fit(this.level, w / h);
  }
  memory() {
    return { ...this.renderer.info.memory };
  }
}
