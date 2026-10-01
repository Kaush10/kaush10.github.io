/**
 * A tiny fluid simulation shared by every floating element on the page.
 *
 * One animation loop tracks the scroll and pointer, then steps each body as a
 * damped spring. Bodies drift on layered waves whose periods never line up,
 * trail behind scrolling, tilt around their anchor as they move, and get
 * pushed by the "current" the pointer makes as it moves through them (or as
 * the page scrolls under a resting pointer).
 */

export type Anchor = "start" | "end";

type Body = {
  el: HTMLElement;
  /** Which edge the body hangs from: "start" = its left edge, "end" = its right. */
  anchor: Anchor;
  weight: number;
  phases: number[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  cx: number;
  cy: number;
  visible: boolean;
};

const STIFFNESS = 38;
const DAMPING = 5.2;
const POINTER_RADIUS = 240;
const POINTER_GAIN = 0.45;
const SCROLL_WAKE_GAIN = 0.35;
const MAX_SCROLL_DRAG = 30;

const bodies = new Set<Body>();

const field = {
  scrollY: 0,
  scrollV: 0,
  pointerX: 0,
  pointerY: 0,
  pointerVX: 0,
  pointerVY: 0,
  pointerActive: false,
  lastPointerT: 0,
  lastT: 0,
  frame: 0,
};

function onPointerMove(event: PointerEvent) {
  const now = event.timeStamp;
  const dt = Math.max(8, now - field.lastPointerT) / 1000;
  if (field.pointerActive && field.lastPointerT) {
    // Blend toward the latest reading so one jittery event can't spike it.
    field.pointerVX += ((event.clientX - field.pointerX) / dt - field.pointerVX) * 0.5;
    field.pointerVY += ((event.clientY - field.pointerY) / dt - field.pointerVY) * 0.5;
  }
  field.pointerX = event.clientX;
  field.pointerY = event.clientY;
  field.lastPointerT = now;
  field.pointerActive = true;
}

function onPointerGone() {
  field.pointerActive = false;
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerType !== "mouse") field.pointerActive = false;
}

function drift(s: number, p: number[], a: number, b: number, c: number) {
  return (
    a * Math.sin(s * 0.37 + p[0]) + b * Math.sin(s * 0.83 + p[1]) + c * Math.sin(s * 1.61 + p[2])
  );
}

function tick(now: number) {
  const dt = Math.min(0.05, (now - (field.lastT || now)) / 1000) || 1 / 60;
  field.lastT = now;

  const scrollY = window.scrollY;
  const rawScrollV = (scrollY - field.scrollY) / dt;
  field.scrollY = scrollY;
  field.scrollV += (rawScrollV - field.scrollV) * Math.min(1, dt * 10);

  const decay = Math.exp(-dt * 7);
  field.pointerVX *= decay;
  field.pointerVY *= decay;

  const viewport = window.innerHeight;
  const s = now / 1000;

  // Read every anchor's layout first, then write every transform, so the
  // browser never has to lay the page out more than once per frame.
  for (const body of bodies) {
    const rect = body.el.parentElement!.getBoundingClientRect();
    body.cx = rect.left + rect.width / 2;
    body.cy = rect.top + rect.height / 2;
    body.visible = rect.bottom > -200 && rect.top < viewport + 200;
  }

  for (const body of bodies) {
    const { weight, phases } = body;
    const m = weight;

    const targetX = drift(s, phases, 2.6, 1.3, 0.6);
    const drag = Math.tanh(field.scrollV / 2400) * MAX_SCROLL_DRAG * weight;
    const targetY = drift(s, phases.slice(3), 3.8, 1.9, 0.9) + drag;

    let fx = 0;
    let fy = 0;
    if (field.pointerActive) {
      const dx = field.pointerX - body.cx;
      const dy = field.pointerY - body.cy;
      const influence = Math.exp(-(dx * dx + dy * dy) / (2 * POINTER_RADIUS * POINTER_RADIUS));
      // In the page's frame, a resting pointer moves as the page scrolls.
      const currentY = field.pointerVY + field.scrollV * SCROLL_WAKE_GAIN;
      fx = field.pointerVX * influence * POINTER_GAIN;
      fy = currentY * influence * POINTER_GAIN;
    }

    const ax = (STIFFNESS * (targetX - body.x) - DAMPING * body.vx + fx) / m;
    const ay = (STIFFNESS * (targetY - body.y) - DAMPING * body.vy + fy) / m;
    body.vx += ax * dt;
    body.vy += ay * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    // The free end trails the anchored end, so vertical motion tilts the
    // body around the edge it hangs from.
    const hang = body.anchor === "end" ? 1 : -1;
    const targetR = Math.tanh((body.vy * hang) / 90) * 1.4 + drift(s, phases.slice(6), 0.22, 0.1, 0);
    body.r += (targetR - body.r) * Math.min(1, dt * 5);
  }

  for (const body of bodies) {
    if (!body.visible) continue;
    body.el.style.transform = `translate(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px) rotate(${body.r.toFixed(3)}deg)`;
  }

  field.frame = requestAnimationFrame(tick);
}

function start() {
  field.scrollY = window.scrollY;
  field.lastT = 0;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerGone, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerGone);
  field.frame = requestAnimationFrame(tick);
}

function stop() {
  cancelAnimationFrame(field.frame);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerGone);
  document.documentElement.removeEventListener("pointerleave", onPointerGone);
  field.pointerActive = false;
}

/** Deterministic per-index phases, so the page looks the same on every load. */
function phasesFor(seed: number) {
  return Array.from({ length: 9 }, (_, i) => ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1) * Math.PI * 2);
}

const WEIGHTS = [1, 0.74, 1.3, 0.88, 1.16, 0.95, 1.22, 0.82, 1.08];

/** Adds an element to the fluid. Returns a function that removes it. */
export function float(el: HTMLElement, index: number, anchor: Anchor) {
  const body: Body = {
    el,
    anchor,
    weight: WEIGHTS[index % WEIGHTS.length],
    phases: phasesFor(index + 1),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 0,
    cx: 0,
    cy: 0,
    visible: true,
  };
  if (bodies.size === 0) start();
  bodies.add(body);

  return () => {
    bodies.delete(body);
    el.style.transform = "";
    if (bodies.size === 0) stop();
  };
}
