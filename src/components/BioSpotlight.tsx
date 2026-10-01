"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { FrameRule } from "@/components/PageFrame";

// The bio sits in the dark until you reach it. Then the dot on its header rule
// (the same dot the hero has) warms up like a lamp and lights the page.
//
// The scene has depth. The frame and lamp are the front plane. The bio sits
// on a wall well behind it: it moves less than the frame when you scroll or
// move the pointer, and you read it through the beam, which hangs in the air
// between. The light lands on the wall brightest near its top, closest to the
// lamp, and shows the wall's grain only where it falls. Dust drifts at three
// depths: far specks are small and sharp, near ones big, soft and slow.
//
// Everything animates opacity and transform only (see `.spot` in
// globals.css). JS switches the light, and moves the layers for parallax.

type Mote = { x: number; y: number; delay: number; duration: number };

/** Dust specks for one depth, spread through the cone. Seeded, so they don't move on reload. */
function motes(count: number, seed: number): Mote[] {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  return Array.from({ length: count }, () => {
    const y = 0.08 + random() * 0.88;
    // The cone widens from the lamp: half-width 1% at the top, 30% at the bottom.
    const half = 0.01 + 0.29 * y;
    return {
      x: 50 + (random() * 2 - 1) * half * 100 * 0.85,
      y: y * 100,
      delay: random() * 12,
      duration: 10 + random() * 8,
    };
  });
}

const DEPTHS = [
  { name: "far", motes: motes(12, 7), shift: 4 },
  { name: "mid", motes: motes(8, 19), shift: 10 },
  { name: "near", motes: motes(5, 41), shift: 22 },
] as const;

// How much the bio's wall lags the page while scrolling (0 = none).
const WALL_DEPTH = 0.12;
// How far, in px, the wall moves with the pointer (negative: away from it).
const WALL_SHIFT = -7;

export function BioSpotlight({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dustRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const lean = leanRef.current;
    const wall = wallRef.current;
    const text = textRef.current;
    if (!section || !lean || !wall || !text) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;

    const step = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.07;
      pointer.y += (pointer.ty - pointer.y) * 0.07;

      // The wall lags the scroll: the further the section is from the middle
      // of the screen, the more it's held back toward it.
      const s = section.getBoundingClientRect();
      const scrollLag = -(s.top + s.height / 2 - window.innerHeight / 2) * WALL_DEPTH;

      const wallTransform = `translate3d(${(pointer.x * WALL_SHIFT).toFixed(2)}px, ${(
        pointer.y * WALL_SHIFT * 0.6 +
        scrollLag
      ).toFixed(2)}px, 0)`;
      wall.style.transform = wallTransform;
      text.style.transform = wallTransform;

      lean.style.transform = `translateX(-50%) rotate(${(-pointer.x * 2.5).toFixed(3)}deg)`;

      DEPTHS.forEach((depth, i) => {
        const layer = dustRefs.current[i];
        if (!layer) return;
        // Nearer dust is nearer the frame, so it lags the scroll less than the wall does.
        const y = pointer.y * depth.shift * 0.6 + scrollLag * (1 - depth.shift / 22);
        layer.style.transform = `translate3d(${(pointer.x * depth.shift).toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });

      const settling = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002;
      raf = active && settling ? requestAnimationFrame(step) : 0;
    };
    const frame = () => {
      if (reduceMotion) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };

    // On when most of the section is in view; off once it's nearly gone, so it replays.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        const lit = section.dataset.lit === "true";
        if (!lit && entry.intersectionRatio > 0.42) section.dataset.lit = "true";
        else if (lit && entry.intersectionRatio < 0.1) delete section.dataset.lit;
        active = entry.isIntersecting;
        if (active) frame();
      },
      { threshold: [0, 0.1, 0.42, 0.6] },
    );
    visibility.observe(section);

    const onPointer = (event: PointerEvent) => {
      const s = section.getBoundingClientRect();
      pointer.tx = ((event.clientX - s.left) / s.width - 0.5) * 2;
      pointer.ty = ((event.clientY - s.top) / s.height - 0.5) * 2;
      frame();
    };
    // Scrolling moves the section, so the lag needs a new frame too.
    const onScroll = () => {
      if (active) frame();
    };
    section.addEventListener("pointermove", onPointer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      visibility.disconnect();
      section.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // This page runs from its own header rule (--frame-top down) to the next
  // section's (--frame-top into it), so its middle sits --frame-top below the
  // section's. The extra top padding moves the content's centre there.
  return (
    <section
      ref={sectionRef}
      id="about"
      className="spot relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-10 pt-[calc(8rem+2*var(--frame-top))] pb-32 md:px-6"
    >
      {/* Back: the wall the bio sits on, lit only where the beam lands. */}
      <div ref={wallRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div className="spot-wash" />
        <div className="spot-grain" />
      </div>

      <div ref={textRef} className="relative mx-auto w-full max-w-[37.8rem]">
        {children}
        {/* Dark until lit; once lit, it falls off with distance from the lamp. */}
        <div aria-hidden className="spot-dark pointer-events-none absolute -inset-x-[12%] -inset-y-[16%]" />
        <div aria-hidden className="spot-falloff pointer-events-none absolute -inset-x-[12%] -inset-y-[16%]" />
      </div>

      {/* Between: the beam and the dust in it, hanging in front of the wall. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div ref={leanRef} className="spot-lean">
          <div className="spot-beam">
            <div className="spot-cone" />
          </div>
        </div>
        {DEPTHS.map((depth, i) => (
          <div
            key={depth.name}
            ref={(el) => {
              dustRefs.current[i] = el;
            }}
            className={`spot-dust spot-dust-${depth.name}`}
          >
            {depth.motes.map((m, j) => (
              <span
                key={j}
                style={{
                  left: `${m.x.toFixed(2)}%`,
                  top: `${m.y.toFixed(2)}%`,
                  animationDelay: `${-m.delay.toFixed(2)}s`,
                  animationDuration: `${m.duration.toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        ))}
        <div className="spot-halo" />
      </div>

      {/* Front: the frame's rule and the lamp on it. */}
      <FrameRule index="01" label="about" glint>
        <span className="spot-lamp relative block size-[calc(var(--frame-dot)*0.62)] rounded-full">
          <span className="spot-filament absolute inset-0 rounded-full" />
        </span>
      </FrameRule>
    </section>
  );
}
