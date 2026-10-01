"use client";

import { useEffect, useRef, useState } from "react";

import type { PaperScene } from "@/components/paper-fall";

// The end of the page: a spotlight comes on, its pool shows on the ground,
// and a sheet of paper falls through the beam, swaying and bending, and
// settles flat in the light. Then the résumé link fades in under it.
//
// The beam and the pool are CSS; the sheet and its shadow are three.js
// (paper-fall.ts), which only loads as the section comes near.

const LIGHT_LEAD = 0.5; // s the light is on before the sheet appears
const BLUR_MAX = 9; // px, how soft the sheet is before it enters the light

export function ResumeDrop({ href }: { href: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lit, setLit] = useState(false);
  const [landed, setLanded] = useState(false);
  const [pool, setPool] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scene: PaperScene | null = null;
    let duration = 0;
    let raf = 0;
    let started = false;
    let disposed = false;

    const load = import("@/components/paper-fall").then((m) => {
      if (disposed) return null;
      scene = m.createPaperScene(canvas);
      duration = m.DURATION;
      setPool(scene.pool());
      scene.render(0);
      return scene;
    });

    const play = async () => {
      if (started) return;
      started = true;
      const s = await load;
      if (!s || disposed) return;
      setLit(true);
      if (reduceMotion) {
        s.render(duration);
        canvas.style.filter = "";
        setLanded(true);
        return;
      }
      const t0 = performance.now() + LIGHT_LEAD * 1000;
      const tick = (now: number) => {
        const t = Math.max(0, (now - t0) / 1000);
        const pose = s.render(Math.min(t, duration));
        canvas.style.filter = pose.blur > 0.01 ? `blur(${(pose.blur * BLUR_MAX).toFixed(2)}px)` : "";
        if (t < duration) raf = requestAnimationFrame(tick);
        else setLanded(true);
      };
      raf = requestAnimationFrame(tick);
    };

    // Load three.js a screen early; play once most of the stage is in view.
    const near = new IntersectionObserver(([e]) => e.isIntersecting && load, { rootMargin: "100% 0px" });
    const inView = new IntersectionObserver(([e]) => e.intersectionRatio > 0.55 && play(), {
      threshold: [0, 0.55, 1],
    });
    near.observe(stage);
    inView.observe(stage);

    const resize = new ResizeObserver(() => {
      if (!scene) return;
      scene.resize();
      setPool(scene.pool());
      if (!raf || !started) scene.render(started ? duration : 0);
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

  return (
    <div ref={stageRef} className={`resume-drop relative h-[78dvh] min-h-[30rem] w-full ${lit ? "is-lit" : ""}`}>
      {pool && (
        <>
          {/* The beam, from the top of the stage down to the pool. */}
          <div
            aria-hidden
            className="resume-beam pointer-events-none absolute"
            style={{
              left: pool.x + pool.w / 2,
              top: 0,
              width: pool.w * 1.05,
              height: pool.y + pool.h / 2,
            }}
          />
          {/* The pool of light on the ground. */}
          <div
            aria-hidden
            className="resume-pool pointer-events-none absolute"
            style={{ left: pool.x, top: pool.y, width: pool.w, height: pool.h }}
          />
        </>
      )}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: pool ? pool.y + pool.h + 28 : "auto", bottom: pool ? "auto" : "3rem" }}
      >
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          tabIndex={landed ? 0 : -1}
          aria-hidden={!landed}
          className={`resume-link inline-flex min-h-11 items-center rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-white/75 transition-all duration-700 hover:border-white/30 hover:bg-white/[0.06] hover:text-white focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
            landed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1.5 opacity-0"
          }`}
        >
          [resume]
        </a>
      </div>
    </div>
  );
}
