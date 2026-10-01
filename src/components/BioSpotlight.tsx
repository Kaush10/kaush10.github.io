"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { FrameRule } from "@/components/PageFrame";

// The bio sits in the dark until you reach it. Then the dot on its header rule
// (the same dot the hero has) flickers on like a lamp, throws a beam down onto
// the text, and lights a pool there. Dust drifts in the beam, the rule catches
// the light, and the pool leans a little toward the pointer.
//
// Layers, back to front: canvas (beam, pool wash, dust, glint) → text →
// shade (black, with a soft hole where the pool is) → lamp.

const DIM = 0.84; // how dark the text is outside the light
const DUST = 70;
const SHADE_X = 0.12; // the shade overhangs the text this much each side
const SHADE_Y = 0.16;
const SOFT = 8; // the beam is drawn at 1/8 resolution and scaled up, which softens it

// Lamp warm-up: brightness steps over the first ~0.75s, like a filament catching.
const FLICKER: [number, number][] = [
  [0, 0],
  [0.08, 0.55],
  [0.14, 0.08],
  [0.24, 0.7],
  [0.3, 0.25],
  [0.42, 0.92],
  [0.5, 0.6],
  [0.75, 1],
];

function flickerAt(t: number) {
  if (t >= 0.75) return 1;
  for (let i = 1; i < FLICKER.length; i++) {
    const [t1, v1] = FLICKER[i];
    if (t <= t1) {
      const [t0, v0] = FLICKER[i - 1];
      return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
    }
  }
  return 1;
}

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

type Mote = { u: number; v: number; du: number; dv: number; size: number; phase: number };

export function BioSpotlight({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    const shade = shadeRef.current;
    const lamp = lampRef.current;
    if (!section || !canvas || !text || !shade || !lamp) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Geometry, in section pixels.
    let W = 0;
    let H = 0;
    let lampX = 0;
    let lampY = 0;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    const soft = document.createElement("canvas");
    const softCtx = soft.getContext("2d");
    const measure = () => {
      W = section.clientWidth;
      H = section.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      soft.width = Math.ceil(W / SOFT);
      soft.height = Math.ceil(H / SOFT);
      const s = section.getBoundingClientRect();
      const r = text.getBoundingClientRect();
      box = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      const l = lamp.getBoundingClientRect();
      lampX = l.left - s.left + l.width / 2;
      lampY = l.top - s.top + l.height / 2;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(section);
    resize.observe(text);

    // State.
    let on = false;
    let switchedAt = -1; // ms, when it last turned on or off
    let level = 0; // lamp brightness at the moment it was switched, for fading out
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };
    const motes: Mote[] = Array.from({ length: DUST }, (_, i) => {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * 12.9898 * n) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        u: r(1) * 2 - 1,
        v: r(2),
        du: (r(3) - 0.5) * 0.02,
        dv: (r(4) - 0.5) * 0.012,
        size: 0.5 + r(5) * 1.3,
        phase: r(6) * Math.PI * 2,
      };
    });

    const visibility = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        const next = on ? ratio > 0.12 : ratio > 0.42;
        if (next !== on) {
          level = brightness(performance.now());
          on = next;
          switchedAt = performance.now();
          start();
        }
        if (!entry.isIntersecting) stop();
      },
      { threshold: [0, 0.12, 0.25, 0.42, 0.6, 0.8, 1] },
    );
    visibility.observe(section);

    const onPointer = (event: PointerEvent) => {
      const s = section.getBoundingClientRect();
      lean.tx = ((event.clientX - s.left) / s.width - 0.5) * 2;
      lean.ty = ((event.clientY - s.top) / s.height - 0.5) * 2;
    };
    if (!reduceMotion) section.addEventListener("pointermove", onPointer);

    /** Lamp brightness, 0–1, at time `now`. */
    function brightness(now: number) {
      if (switchedAt < 0) return 0;
      const t = (now - switchedAt) / 1000;
      if (on) return reduceMotion ? 1 : flickerAt(t);
      return level * (1 - ease(t / 0.6));
    }

    /** How far the beam reaches toward the text, 0–1. Grows after the lamp catches. */
    function reach(now: number) {
      if (switchedAt < 0) return 0;
      const t = (now - switchedAt) / 1000;
      if (on) return reduceMotion ? 1 : ease((t - 0.35) / 0.9);
      return level > 0 ? 1 - ease(t / 0.5) : 0;
    }

    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const I = brightness(now);
      const R = reach(now);
      lean.x += (lean.tx - lean.x) * (1 - Math.exp(-dt * 2.5));
      lean.y += (lean.ty - lean.y) * (1 - Math.exp(-dt * 2.5));

      // Where the light lands: the middle of the text, nudged toward the pointer.
      const poolX = box.x + box.w / 2 + lean.x * box.w * 0.07;
      const poolY = box.y + box.h * 0.48 + lean.y * box.h * 0.05;
      const rx = box.w * 0.66;
      const ry = box.h * 0.7;

      // Shade: dark everywhere on the text except a soft ellipse where the pool is.
      const P = ease((R - 0.25) / 0.75);
      // (The shade overhangs the text by SHADE_X and SHADE_Y on each side.)
      const sx = box.x - box.w * SHADE_X;
      const sy = box.y - box.h * SHADE_Y;
      shade!.style.setProperty("--px", `${((poolX - sx) / (box.w * (1 + 2 * SHADE_X))) * 100}%`);
      shade!.style.setProperty("--py", `${((poolY - sy) / (box.h * (1 + 2 * SHADE_Y))) * 100}%`);
      shade!.style.setProperty("--pr", `${Math.max(0.5, P * 64)}%`);
      shade!.style.opacity = String(DIM * (1 - 0.15 * P * I));

      lamp!.style.setProperty("--lamp", I.toFixed(3));

      // Canvas.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      if (I > 0.002) drawLight(now / 1000, I, R, poolX, poolY, rx, ry);

      const settled = (on && now - switchedAt > 2000 && reduceMotion) || (!on && I <= 0.002);
      raf = settled ? 0 : requestAnimationFrame(frame);
    }

    function drawLight(t: number, I: number, R: number, poolX: number, poolY: number, rx: number, ry: number) {
      const c = ctx!;
      const baseY = lampY + (poolY + ry * 0.25 - lampY) * R;
      const halfTop = 4;
      const halfBase = rx * 0.92 * (0.35 + 0.65 * R);
      const skew = poolX - lampX;

      // Glint: the header rule catches light either side of the lamp.
      const glint = c.createLinearGradient(lampX - W * 0.32, 0, lampX + W * 0.32, 0);
      glint.addColorStop(0, "rgba(255,255,255,0)");
      glint.addColorStop(0.5, `rgba(255,255,255,${0.55 * I})`);
      glint.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = glint;
      c.fillRect(lampX - W * 0.32, lampY - 0.5, W * 0.64, 1);

      // Beam and rays go on a canvas at 1/SOFT resolution, then get scaled up:
      // the upscale does the blurring, far cheaper than a blur filter.
      const b = softCtx!;
      b.setTransform(1 / SOFT, 0, 0, 1 / SOFT, 0, 0);
      b.clearRect(0, 0, W, H);
      b.globalCompositeOperation = "lighter";
      for (let k = 0; k < 4; k++) {
        const f = 1 - k * 0.2;
        const g = b.createLinearGradient(0, lampY, 0, baseY);
        g.addColorStop(0, `rgba(255,255,255,${0.11 * I})`);
        g.addColorStop(0.55, `rgba(255,255,255,${0.045 * I})`);
        g.addColorStop(1, `rgba(255,255,255,${0.012 * I})`);
        b.fillStyle = g;
        b.beginPath();
        b.moveTo(lampX - halfTop * f, lampY);
        b.lineTo(lampX + halfTop * f, lampY);
        b.lineTo(lampX + skew * R + halfBase * f, baseY);
        b.lineTo(lampX + skew * R - halfBase * f, baseY);
        b.closePath();
        b.fill();
      }
      // Rays: a few soft shafts through the beam that slowly breathe.
      for (let i = 0; i < 7; i++) {
        const u = -0.8 + (i / 6) * 1.6;
        const a = 0.05 * I * R * (0.55 + 0.45 * Math.sin(t * 0.35 + i * 1.7));
        b.strokeStyle = `rgba(255,255,255,${a})`;
        b.lineWidth = 8 + (i % 3) * 6;
        b.beginPath();
        b.moveTo(lampX, lampY);
        b.lineTo(lampX + skew * R + u * halfBase, baseY);
        b.stroke();
      }
      c.save();
      c.globalCompositeOperation = "lighter";
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = "high";
      c.drawImage(soft, 0, 0, soft.width, soft.height, 0, 0, soft.width * SOFT, soft.height * SOFT);

      // Pool: the wash of light on the page behind the text.
      const pool = c.createRadialGradient(poolX, poolY, 0, poolX, poolY, 1);
      pool.addColorStop(0, `rgba(255,255,255,${0.085 * I * R})`);
      pool.addColorStop(0.55, `rgba(255,255,255,${0.035 * I * R})`);
      pool.addColorStop(1, "rgba(255,255,255,0)");
      c.save();
      c.translate(poolX, poolY);
      c.scale(rx * 1.15, ry * 1.05);
      c.translate(-poolX, -poolY);
      c.fillStyle = pool;
      c.beginPath();
      c.arc(poolX, poolY, 1, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Dust: specks drifting in the beam, brightest near its axis and the lamp.
      for (const m of motes) {
        if (!reduceMotion) {
          m.u += m.du * 0.016 + Math.sin(t * 0.5 + m.phase) * 0.0006;
          m.v += m.dv * 0.016;
          if (m.u > 1) m.u = -1;
          if (m.u < -1) m.u = 1;
          if (m.v > 1) m.v = 0;
          if (m.v < 0) m.v = 1;
        }
        if (m.v > R) continue;
        const y = lampY + (baseY - lampY) * m.v;
        const half = halfTop + (halfBase - halfTop) * m.v;
        const x = lampX + skew * R * m.v + m.u * half;
        const twinkle = 0.6 + 0.4 * Math.sin(t * 1.3 + m.phase);
        const a = 0.5 * I * (1 - m.u * m.u) * (1 - 0.55 * m.v) * twinkle;
        c.fillStyle = `rgba(255,255,255,${a})`;
        c.beginPath();
        c.arc(x, y, m.size, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    function start() {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      section.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-10 py-32 md:px-6"
    >
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />

      <FrameRule index="01" label="about">
        <span
          ref={lampRef}
          className="lamp block size-[calc(var(--frame-dot)*0.62)] rounded-full"
        />
      </FrameRule>

      <div ref={textRef} className="relative mx-auto w-full max-w-2xl">
        {children}
        <div
          ref={shadeRef}
          aria-hidden
          className="spotlight-shade pointer-events-none absolute -inset-x-[12%] -inset-y-[16%] bg-black"
          style={{ opacity: DIM }}
        />
      </div>
    </section>
  );
}
