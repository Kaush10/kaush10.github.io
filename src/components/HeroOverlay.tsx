"use client";

import { motion, useScroll, useTransform } from "motion/react";

/**
 * Over the hero scene: the page heading, the scroll cue, and a dim that comes
 * up as you scroll away. The headline itself is drawn by the scene (its
 * `text` layer), which also fades and lifts it on scroll, so the heading
 * here is for screen readers and search only.
 */
export function HeroOverlay({ headline }: { headline: string }) {
  const { scrollY } = useScroll();
  const dim = useTransform(scrollY, [0, 700], [0, 0.75]);
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-black"
      />

      <h1 className="sr-only">{headline}</h1>

      {/* The cue: a line draws down, grows an arrowhead, holds, then erases
          itself from the top into the tip, and starts again. */}
      <motion.a
        href="#about"
        aria-label="Scroll to about"
        style={{ opacity: cueOpacity }}
        className="absolute bottom-5 grid min-h-11 min-w-11 place-items-center px-3 py-2 text-white/20 transition-colors hover:text-white/50 focus-visible:outline-1 focus-visible:outline-white/40"
      >
        <svg
          aria-hidden
          viewBox="0 0 12 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          className="scroll-arrow h-[18px] w-3 overflow-visible"
        >
          <path className="scroll-arrow-line" pathLength={1} d="M6 1V16" />
          <path
            className="scroll-arrow-head"
            pathLength={1}
            d="M6 16.5 3.5 14"
          />
          <path
            className="scroll-arrow-head"
            pathLength={1}
            d="M6 16.5 8.5 14"
          />
        </svg>
      </motion.a>
    </>
  );
}
