"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Headline and scroll cue over the hero. Scrolling away lifts the headline,
 * softens it out of focus, and dims the scene behind it.
 */
export function HeroOverlay({ headline }: { headline: string }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, -140]);
  const opacity = useTransform(scrollY, [0, 520], [1, 0]);
  const blur = useTransform(scrollY, [0, 520], ["blur(0px)", "blur(10px)"]);
  const dim = useTransform(scrollY, [0, 700], [0, 0.75]);
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-black"
      />

      <motion.h1
        style={reduceMotion ? { opacity } : { y, opacity, filter: blur }}
        className="pointer-events-none absolute inset-x-0 top-[72%] -translate-y-1/2 px-6 text-center font-serif text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[-0.01em] text-foreground [text-shadow:0_0_48px_rgb(255_255_255/0.28)]"
      >
        {headline}
      </motion.h1>

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
