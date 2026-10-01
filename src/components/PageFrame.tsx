"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

// The hero scene draws a thin frame: two rails and a header rule with a dot
// on it. The rest of the page continues that frame, so the whole thing reads
// as one bordered sheet. Each section opens with its own header rule.

/**
 * The frame's side rails, from the bottom of the hero (where the scene's own
 * rails end) down to the closing rule. They come in as the hero dims away.
 */
export function FrameRails() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, (y) => {
    const vh = typeof window === "undefined" ? 800 : window.innerHeight;
    return Math.min(1, Math.max(0, (y - vh * 0.45) / (vh * 0.45)));
  });

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 top-[100dvh] bottom-[var(--frame-top)]"
    >
      <span className="absolute inset-y-0 left-[var(--frame-x)] w-px bg-[var(--frame-line)]" />
      <span className="absolute inset-y-0 right-[var(--frame-x)] w-px bg-[var(--frame-line)]" />
    </motion.div>
  );
}

/**
 * A section's header rule, spanning rail to rail with something at its centre
 * (usually a dot). It draws outward from the centre the first time it's seen.
 * `index` and `label` are set small under each end, like a page header.
 */
export function FrameRule({
  index,
  label,
  position = "top",
  children,
}: {
  index: string;
  label: string;
  /** `top`: a header, 7.1% down the section. `bottom`: the closing rule, 7.1% up from its end. */
  position?: "top" | "bottom";
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const place = position === "top" ? "top-[var(--frame-top)]" : "bottom-[var(--frame-top)]";

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-[var(--frame-x)] ${place} h-px`}>
      <motion.span
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        className="absolute inset-0 bg-[var(--frame-line)]"
      />
      <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">
        {index}
      </div>
      <div className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">
        {label}
      </div>
      {children && <div className="absolute top-0 left-1/2 -translate-1/2">{children}</div>}
    </div>
  );
}

/** A dot for the centre of a rule. `ring` is unlit; `solid` is the dim bookend to the hero's dot. */
export function FrameDot({ variant }: { variant: "ring" | "solid" }) {
  return (
    <span
      className={`block size-[calc(var(--frame-dot)*0.42)] rounded-full ${
        variant === "ring"
          ? "border border-white/25 bg-black"
          : "bg-[#5c5c60] shadow-[0_0_14px_rgb(255_255_255/0.12)]"
      }`}
    />
  );
}
