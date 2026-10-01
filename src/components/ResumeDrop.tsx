"use client";

import { useEffect, useRef, useState } from "react";

import type { PaperScene } from "@/components/paper-fall";
import { timelineLit } from "@/components/timeline-light";

// The end of the timeline. The light that rode down the spine arrives at its
// end and flickers on as a lamp, throwing a spotlight onto the ground below.
// A sheet of paper falls through the beam, swaying and bending, and settles
// flat in the pool; then the résumé link fades in under it. From then on the
// timeline above stays lit (timelineLit).
//
// The lamp, beam, pool and dust are CSS; the sheet and its shadow are
// three.js (paper-fall.ts), which only loads as the section comes near.

const LIGHT_LEAD = 0.1; // s from the lamp catching to the sheet's release
const POOL_WIDEN = 1.5; // the pool reaches wider across the ground than the 3D light's cone
// [resume] starts opening this long before touchdown, so the scroll is
// already unrolling as the sheet lands.
const UNLOCK_BEFORE = 0.8; // s
const BLUR_MAX = 10; // px, how soft the sheet is before it enters the light

type Rect = { x: number; y: number; w: number; h: number };

/** The canvas can sit above the stage's top (on phones); move a canvas rect into stage coordinates. */
const inStage = (r: Rect, canvas: HTMLCanvasElement): Rect => ({
  ...r,
  y: r.y + canvas.offsetTop,
});

const widen = (r: Rect): Rect => ({
  ...r,
  x: r.x - (r.w * (POOL_WIDEN - 1)) / 2,
  w: r.w * POOL_WIDEN,
});

// Dust in the beam, mostly low down where the light is strongest on the air.
const MOTES = Array.from({ length: 9 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 91.17 * n) * 43758.5453;
    return x - Math.floor(x);
  };
  const y = 0.25 + Math.sqrt(r(1)) * 0.72; // 0 at the lamp, 1 at the pool
  return {
    y,
    x: (r(2) * 2 - 1) * (0.06 + 0.4 * y), // within the widening cone
    size: r(3) < 0.2 ? 3.5 : r(3) < 0.6 ? 2 : 1.4,
    delay: r(4) * 12,
    duration: 11 + r(5) * 8,
    depth: r(3) < 0.2 ? 2 : 1,
  };
});

export function ResumeDrop({ href }: { href: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lit, setLit] = useState(false);
  const [landed, setLanded] = useState(false);
  const [pool, setPool] = useState<Rect | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let scene: PaperScene | null = null;
    let duration = 0;
    let touchdown = 0;
    let raf = 0;
    let started = false;
    let disposed = false;

    const load = import("@/components/paper-fall").then((m) => {
      if (disposed) return null;
      scene = m.createPaperScene(canvas);
      duration = m.DURATION;
      touchdown = m.FALL;
      setPool(widen(inStage(scene.pool(), canvas)));
      scene.render(0);
      return scene;
    });

    const play = async () => {
      if (started) return;
      started = true;
      timelineLit.set(1);
      setLit(true);
      const s = await load;
      if (!s || disposed) return;
      if (reduceMotion) {
        s.render(duration);
        setLanded(true);
        return;
      }
      const t0 = performance.now() + LIGHT_LEAD * 1000;
      const tick = (now: number) => {
        const t = Math.max(0, (now - t0) / 1000);
        const pose = s.render(Math.min(t, duration));
        canvas.style.filter =
          pose.blur > 0.01
            ? `blur(${(pose.blur * BLUR_MAX).toFixed(2)}px)`
            : "";
        if (t >= touchdown - UNLOCK_BEFORE) setLanded(true);
        if (t < duration) raf = requestAnimationFrame(tick);
        else raf = 0;
      };
      raf = requestAnimationFrame(tick);
    };

    // Load three.js a screen early. The light comes on once the stage is all
    // but fully in view, which is the bottom of the page.
    const near = new IntersectionObserver(([e]) => e.isIntersecting && load, {
      rootMargin: "100% 0px",
    });
    const inView = new IntersectionObserver(
      ([e]) => e.intersectionRatio > 0.85 && play(),
      {
        threshold: [0, 0.5, 0.85, 1],
      },
    );
    near.observe(stage);
    inView.observe(stage);

    const resize = new ResizeObserver(() => {
      if (!scene) return;
      scene.resize();
      setPool(widen(inStage(scene.pool(), canvas)));
      if (!raf) scene.render(started ? duration : 0);
    });
    resize.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      inView.disconnect();
      resize.disconnect();
      (scene as PaperScene | null)?.dispose();
    };
  }, []);

  const apex = pool ? pool.x + pool.w / 2 : 0;
  const beamHeight = pool ? pool.y + pool.h / 2 : 0;

  return (
    <div
      ref={stageRef}
      className={`resume-drop relative h-[34svh] min-h-[16rem] w-full md:h-[56svh] md:min-h-[24rem] ${lit ? "is-lit" : ""}`}
    >
      {pool && (
        <>
          {/* Desktop: a spotlight. The beam runs from the lamp down to its
              pool on the ground. */}
          <div
            aria-hidden
            className="resume-beam pointer-events-none absolute top-0 hidden md:block"
            style={{ left: apex, width: pool.w * 0.9, height: beamHeight }}
          />
          <div
            aria-hidden
            className="resume-spot pointer-events-none absolute hidden md:block"
            style={{ left: pool.x, top: pool.y, width: pool.w, height: pool.h }}
          />
          {/* Phones: the lamp stays on the spine at the left, so no cone;
              a soft glow on the ground under the sheet shows the ground's
              angle. */}
          <div
            aria-hidden
            className="resume-pool pointer-events-none absolute md:hidden"
            style={{
              left: pool.x - pool.w * 0.35,
              top: pool.y - pool.h * 0.6,
              width: pool.w * 1.7,
              height: pool.h * 2.2,
            }}
          />
          {/* Dust drifting in the light. */}
          <div
            aria-hidden
            className="resume-dust pointer-events-none absolute top-0"
            style={{ left: apex, height: beamHeight }}
          >
            {MOTES.map((m, i) => (
              <span
                key={i}
                style={{
                  left: `${(m.x * pool.w).toFixed(1)}px`,
                  top: `${(m.y * 100).toFixed(1)}%`,
                  width: m.size,
                  height: m.size,
                  filter: m.depth === 2 ? "blur(1.2px)" : undefined,
                  opacity: m.depth === 2 ? 0.5 : 0.85,
                  ["--a" as string]: m.depth === 2 ? 2 : 1,
                  animationDelay: `${-m.delay.toFixed(2)}s`,
                  animationDuration: `${m.duration.toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
      {/* On phones the stage is short, so the ground sits close under the
          timeline, but the canvas keeps the full height (and so the sheet its
          size): it extends up past the lamp, and fades out above it so the
          sheet only appears once it's in the light. */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="resume-canvas pointer-events-none absolute inset-x-0 top-[-22svh] h-[56svh] w-full min-h-[24rem] md:top-0 md:h-full"
      />
      {/* The lamp: the end of the timeline's spine (at the left on phones,
          the centre on desktop). */}
      <span
        aria-hidden
        className="resume-lamp pointer-events-none absolute top-0 left-0 md:left-[var(--apex)]"
        style={{ ["--apex" as string]: pool ? `${apex}px` : "50%" }}
      >
        <span className="resume-filament" />
      </span>
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: pool ? pool.y + pool.h + 18 : "auto" }}
      >
        {/* The brackets start together and part like a scroll unrolling,
            revealing the word from its middle out, as the whole link
            fades in from a blur. */}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          tabIndex={landed ? 0 : -1}
          aria-hidden={!landed}
          aria-label="resume"
          data-open={landed || undefined}
          className={`resume-link inline-flex min-h-11 items-center font-mono text-[12px] tracking-wider text-white/70 transition-colors hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60 ${
            landed ? "" : "pointer-events-none"
          }`}
        >
          <span aria-hidden>[</span>
          <span aria-hidden className="resume-scroll">
            <span>resume</span>
          </span>
          <span aria-hidden>]</span>
        </a>
      </div>
    </div>
  );
}
