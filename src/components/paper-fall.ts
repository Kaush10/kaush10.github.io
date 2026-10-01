import * as THREE from "three";

// A sheet of paper falling through a spotlight onto the ground.
//
// The fall is a "falling leaf": the sheet rocks side to side like a pendulum,
// gliding fast through the middle of each swing and slowing (almost hanging)
// at the ends, where it's tipped furthest with its outer edge raised. As it
// moves, the air bends it: it dishes along its width when it drops fastest,
// and the leading edge lifts as it glides. Near the ground the swings die
// out; it touches down on one edge and settles flat, the bend relaxing last.
//
// Units: the ground is y = 0, the sheet is US letter, 1 unit wide.

const PAPER_W = 1.2;
const PAPER_H = 1.2 * (11 / 8.5);
// The sheet lies turned a quarter, long side toward the viewer: its length
// runs side to side (the axis it swings and rocks along), its width front to back.
const HALF_SIDE = PAPER_H / 2;
const HALF_DEPTH = PAPER_W / 2;
const SEG_X = 28;
const SEG_Y = 36;

export const FALL = 2.3; // s from release to touchdown
const SETTLE = 0.6; // s for the sheet to lie flat after touchdown
export const DURATION = FALL + SETTLE;

const START_HEIGHT = 2.7;
const SWINGS = 2.25; // full side-to-side cycles during the fall
const SWAY = 0.62; // lateral reach of a swing
const ROLL = 0.62; // rad, tilt at the end of a swing
const PITCH = 0.16; // rad, the nose-up/nose-down wobble
const DISH = 0.14; // dish across the width at full speed
const LEAD = 0.1; // leading-edge lift while gliding
const CURL = 0.05; // gentle curl along the length

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Height over time: descent speed peaks mid-swing and drops at the ends. */
const heightTable = (() => {
  const n = 600;
  const table = new Float32Array(n + 1);
  let acc = 0;
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    const phase = 2 * Math.PI * SWINGS * s;
    const speed = (0.32 + Math.cos(phase) ** 2) * smooth(0, 0.08, s) * (1 - 0.55 * smooth(0.8, 1, s));
    table[i] = acc;
    acc += speed / n;
  }
  for (let i = 0; i <= n; i++) table[i] /= acc;
  return table;
})();
const heightAt = (s: number) => {
  const x = Math.min(1, Math.max(0, s)) * (heightTable.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return START_HEIGHT * (1 - (heightTable[i] * (1 - f) + (heightTable[Math.min(i + 1, heightTable.length - 1)] ?? 1) * f));
};

type Pose = {
  x: number;
  y: number;
  z: number;
  roll: number;
  pitch: number;
  yaw: number;
  /** bend coefficients, in local units: dish (u²), lead (u³), curl (v²) */
  dish: number;
  lead: number;
  curl: number;
  opacity: number;
  blur: number;
};

/** Where the sheet is and how it's bent, `t` seconds after release. */
export function poseAt(t: number): Pose {
  const s = t / FALL;
  const yaw = -0.42 + 0.58 * smooth(0, 1.15, s);
  // It comes out of the dark slowly: fading and sharpening over half the fall.
  const opacity = smooth(0.02, 0.5, s);
  const blur = 1 - smooth(0.03, 0.55, s);

  if (s <= 1) {
    const phase = 2 * Math.PI * SWINGS * s;
    const swing = 1 - smooth(0.66, 1, s); // swings die out as it nears the ground
    const glide = Math.cos(phase); // lateral velocity, -1..1
    const speed = 0.35 + 0.65 * glide * glide; // how fast it's dropping, 0..1
    const roll = ROLL * swing * Math.sin(phase);
    const pitch = PITCH * swing * Math.sin(1.55 * phase + 0.9);
    const dish = DISH * speed * swing + 0.02 * (1 - s);
    // The edge it's gliding toward lifts. (Local +v points to world −x after the quarter turn.)
    const lead = -LEAD * glide * swing;
    const curl = CURL * Math.sin(0.8 * phase + 0.4) * swing;
    // It never sinks into the ground: the lowest point of the tipped, bent sheet sits on it.
    const clearance = HALF_SIDE * Math.abs(Math.sin(roll)) + HALF_DEPTH * Math.abs(Math.sin(pitch)) + Math.max(0, -dish) + Math.abs(lead) * 0.5;
    return {
      x: SWAY * swing * Math.sin(phase) * 0.9 + 0.08 * (1 - s),
      y: Math.max(heightAt(s), clearance + 0.004),
      z: 0.1 * Math.sin(0.7 * phase) * swing,
      roll,
      pitch,
      yaw,
      dish,
      lead,
      curl,
      opacity,
      blur,
    };
  }

  // Touchdown: what's left of the tilt and bend settles out, a little springy.
  const end = poseAt(FALL - 1e-4);
  const k = (t - FALL) / SETTLE;
  const decay = Math.exp(-5 * k) * Math.cos(7 * k);
  const flatten = Math.exp(-4.2 * k);
  const roll = end.roll * decay;
  const pitch = end.pitch * decay;
  const dish = end.dish * flatten;
  const lead = end.lead * flatten;
  const curl = end.curl * flatten;
  const clearance = HALF_SIDE * Math.abs(Math.sin(roll)) + HALF_DEPTH * Math.abs(Math.sin(pitch)) + Math.abs(lead) * 0.5;
  return { x: end.x, y: clearance + 0.004, z: end.z, roll, pitch, yaw: end.yaw, dish, lead, curl, opacity: 1, blur: 0 };
}

/** The sheet's face: paper with grey bars standing in for a résumé's text. */
function paperTexture(anisotropy: number) {
  const W = 680;
  const H = Math.round(W * (PAPER_H / PAPER_W));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#cbc8c0";
  c.fillRect(0, 0, W, H);
  const m = W * 0.1;
  const bar = (x: number, y: number, w: number, h: number, shade: number) => {
    c.fillStyle = `rgb(${shade} ${shade} ${shade + 2})`;
    c.fillRect(x, y, w, h);
  };
  let y = m;
  bar(m, y, W * 0.42, 20, 70); // name
  y += 34;
  bar(m, y, W * 0.6, 8, 150); // contact line
  y += 40;
  const widths = [0.92, 0.86, 0.9, 0.62];
  for (let section = 0; section < 4; section++) {
    bar(m, y, W * 0.24, 11, 95); // section heading
    y += 20;
    c.fillStyle = "rgb(190 190 192)";
    c.fillRect(m, y, W - 2 * m, 1.5); // rule under it
    y += 16;
    const items = section === 0 ? 2 : 3;
    for (let item = 0; item < items && y < H - m; item++) {
      bar(m, y, W * 0.4, 9, 115);
      bar(W - m - W * 0.16, y, W * 0.16, 9, 150);
      y += 19;
      const lines = 2 + ((section + item) % 2);
      for (let l = 0; l < lines && y < H - m; l++) {
        bar(m + 14, y, (W - 2 * m - 14) * widths[(l + item) % widths.length], 7, 165);
        y += 15;
      }
      y += 10;
    }
    y += 8;
  }
  // Matte paper: grain over everything, a few faint fibers, and edges a shade
  // darker, so it never reads as a flat white card.
  const image = c.getImageData(0, 0, W, H);
  const px = image.data;
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < px.length; i += 4) {
    const n = (random() - 0.5) * 30;
    px[i] += n;
    px[i + 1] += n;
    px[i + 2] += n;
  }
  c.putImageData(image, 0, 0);
  c.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const x = random() * W;
    const y0 = random() * H;
    const len = 6 + random() * 18;
    const a = random() * Math.PI;
    c.strokeStyle = `rgb(${random() < 0.5 ? "120 118 112" : "235 232 226"} / ${(0.05 + random() * 0.08).toFixed(3)})`;
    c.beginPath();
    c.moveTo(x, y0);
    c.lineTo(x + Math.cos(a) * len, y0 + Math.sin(a) * len);
    c.stroke();
  }
  const edge = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.55);
  // Edges a shade lighter, like a drawn sheet catching the light, not a rendered one.
  edge.addColorStop(0, "rgb(255 255 255 / 0)");
  edge.addColorStop(1, "rgb(245 242 236 / 0.3)");
  c.fillStyle = edge;
  c.fillRect(0, 0, W, H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}

export type PaperScene = {
  /** Draw the scene `t` seconds into the drop. */
  render: (t: number) => Pose;
  /** The spotlight's pool on the ground, in canvas pixels. */
  pool: () => { x: number; y: number; w: number; h: number };
  resize: () => void;
  dispose: () => void;
};

const POOL_RADIUS = 1.25;

export function createPaperScene(canvas: HTMLCanvasElement): PaperScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  // The spotlight, straight down from above with a soft edge, and only a trace of room light.
  const spot = new THREE.SpotLight("#fff6ea", 30, 20, 0.36, 0.85, 1.4);
  spot.position.set(0, 7.5, 0.15);
  spot.target.position.set(0, 0, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.radius = 4;
  spot.shadow.blurSamples = 16;
  spot.shadow.bias = -0.0004;
  spot.shadow.camera.near = 2;
  spot.shadow.camera.far = 12;
  scene.add(spot, spot.target);
  scene.add(new THREE.AmbientLight("#ffffff", 0.06));

  // Ground: invisible except for the shadow falling on it. The shadow is
  // faint and wide while the sheet is high, and darkens and sharpens as it
  // comes down (see render).
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.4 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), shadowMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // The sheet: a finely divided plane, bent by moving its vertices along its normal.
  const geometry = new THREE.PlaneGeometry(PAPER_W, PAPER_H, SEG_X, SEG_Y);
  const rest = Float32Array.from(geometry.attributes.position.array);
  const texture = paperTexture(renderer.capabilities.getMaxAnisotropy());
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    // Part of its colour is unlit, which flattens the shading toward an
    // illustration: the bends still read, without a rendered falloff.
    emissive: "#ffffff",
    emissiveMap: texture,
    emissiveIntensity: 0.38,
  });
  const sheet = new THREE.Mesh(geometry, material);
  sheet.castShadow = true;
  sheet.receiveShadow = false;
  // Rotation order: lie flat, turn about the vertical (yaw), then tip (roll, pitch).
  const holder = new THREE.Group();
  holder.add(sheet);
  // Lie flat, turned a quarter in its own plane: length side to side.
  sheet.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  scene.add(holder);

  const bend = (dish: number, lead: number, curl: number) => {
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      // v runs along the length, which lies side to side; u along the width, front to back.
      const u = rest[i] / (PAPER_W / 2);
      const v = rest[i + 1] / (PAPER_H / 2);
      // local z is the sheet's normal; after lying flat it points up. The
      // dish and the lifted leading edge are across the swing (along v).
      pos[i + 2] = dish * v * v + lead * v * v * v + curl * u * u;
      // keep the sheet's length roughly constant as it bends
      pos[i + 1] = rest[i + 1] * (1 - 0.5 * (dish * dish + lead * lead) * v * v);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the pool and the drop in frame on narrow screens: back the camera off.
    const back = camera.aspect < 1 ? 1 / camera.aspect : 1;
    // A low eye line, so the ground is steeply foreshortened and the pool a flat oval.
    camera.position.set(0, 2.4 * back, 9.2 * back);
    camera.lookAt(0, 1.05, 0);
    camera.updateProjectionMatrix();
  };
  resize();

  const render = (t: number) => {
    const p = poseAt(t);
    holder.position.set(p.x, p.y, p.z);
    holder.rotation.set(p.pitch, p.yaw, p.roll, "YXZ");
    bend(p.dish, p.lead, p.curl);
    material.opacity = p.opacity;
    const near = 1 - Math.min(1, p.y / 2.2); // 0 high up, 1 on the ground
    shadowMaterial.opacity = 0.42 * near * near * p.opacity;
    spot.shadow.radius = 2 + 22 * (1 - near);
    renderer.render(scene, camera);
    return p;
  };

  const pool = () => {
    camera.updateMatrixWorld(); // project() reads the camera's matrices, which only update on render otherwise
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * POOL_RADIUS, 0, Math.sin(a) * POOL_RADIUS).project(camera);
      xs.push(((v.x + 1) / 2) * w);
      ys.push(((1 - v.y) / 2) * h);
    }
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    return { x: x0, y: y0, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
  };

  return {
    render,
    pool,
    resize,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
