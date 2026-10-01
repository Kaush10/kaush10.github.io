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

      <motion.a
        href="#about"
        style={{ opacity: cueOpacity }}
        className="absolute bottom-6 flex min-h-11 min-w-11 flex-col items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-widest text-white/30 uppercase transition-colors hover:text-white/60 focus-visible:outline-1 focus-visible:outline-white/40"
      >
        scroll
        <span aria-hidden className="scroll-cue block h-8 w-px bg-white/40" />
      </motion.a>
    </>
  );
}
