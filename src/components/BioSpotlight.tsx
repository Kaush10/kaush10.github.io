"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { FrameRule } from "@/components/PageFrame";

// The bio sits in the dark until you reach it. Then the dot on its header rule
// (the same dot the hero has) warms up like a lamp, a soft wash of light falls
// from it, and the text comes up out of the dark.
//
// Everything here is CSS (see `.spot` in globals.css) and animates only
// opacity and transform, so the browser composites it without repainting.
// JS just switches it on and off, and tilts the light toward the pointer.

const MOTES = [
  { x: 46, y: 18, d: 0 },
  { x: 55, y: 30, d: 1.6 },
  { x: 41, y: 44, d: 3.1 },
  { x: 60, y: 52, d: 0.8 },
  { x: 50, y: 63, d: 2.4 },
  { x: 37, y: 71, d: 4.2 },
  { x: 64, y: 76, d: 1.2 },
  { x: 52, y: 86, d: 3.6 },
];

export function BioSpotlight({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const lean = leanRef.current;
    if (!section || !lean) return;

    // On when most of the section is in view; off once it's nearly gone, so it replays.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        const lit = section.dataset.lit === "true";
        if (!lit && entry.intersectionRatio > 0.42) section.dataset.lit = "true";
        else if (lit && entry.intersectionRatio < 0.1) delete section.dataset.lit;
      },
      { threshold: [0, 0.1, 0.42, 0.6] },
    );
    visibility.observe(section);

    // The light swings a couple of degrees toward the pointer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => visibility.disconnect();
    }
    let target = 0;
    let angle = 0;
    let raf = 0;
    const step = () => {
      angle += (target - angle) * 0.08;
      lean.style.transform = `translateX(-50%) rotate(${angle.toFixed(3)}deg)`;
      raf = Math.abs(target - angle) > 0.01 ? requestAnimationFrame(step) : 0;
    };
    const onPointer = (event: PointerEvent) => {
      const s = section.getBoundingClientRect();
      target = -((event.clientX - s.left) / s.width - 0.5) * 5;
      if (!raf) raf = requestAnimationFrame(step);
    };
    section.addEventListener("pointermove", onPointer);

    return () => {
      visibility.disconnect();
      section.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="spot relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-10 py-32 md:px-6"
    >
      {/* The light: a soft cone hanging from the lamp, and the wash where it lands. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div ref={leanRef} className="spot-lean">
          <div className="spot-beam">
            <div className="spot-cone" />
          </div>
          <div className="spot-motes">
            {MOTES.map((m) => (
              <span
                key={`${m.x}-${m.y}`}
                style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${-m.d}s` }}
              />
            ))}
          </div>
        </div>
        <div className="spot-wash" />
        <div className="spot-halo" />
      </div>

      <FrameRule index="01" label="about" glint>
        <span className="spot-lamp relative block size-[calc(var(--frame-dot)*0.62)] rounded-full">
          <span className="spot-filament absolute inset-0 rounded-full" />
        </span>
      </FrameRule>

      <div className="relative mx-auto w-full max-w-2xl">
        {children}
        {/* Dark until lit; once lit, only the edges stay a little dim. */}
        <div aria-hidden className="spot-dark pointer-events-none absolute -inset-x-[12%] -inset-y-[16%]" />
        <div aria-hidden className="spot-falloff pointer-events-none absolute -inset-x-[12%] -inset-y-[16%]" />
      </div>
    </section>
  );
}
