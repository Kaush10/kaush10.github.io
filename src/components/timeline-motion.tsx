"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef, type ReactNode } from "react";

// Each entry gets its own weight, so neighbours drift out of step with each
// other instead of moving as one sheet.
const WEIGHTS = [1, 0.72, 1.28, 0.86, 1.14, 0.94, 1.2, 0.8];

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/**
 * Floats its children as if suspended in fluid: scrolling drags them behind
 * the page and they bob back into place; at rest they sway on their own.
 */
export function FloatingEntry({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const weight = WEIGHTS[index % WEIGHTS.length];
  const phase = index * 1.9;

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const drag = useTransform(scrollVelocity, (v) => clamp(v * 0.028 * weight, 42));
  // Underdamped, so a hard stop leaves the entry bobbing for a beat.
  const lag = useSpring(drag, { stiffness: 64, damping: 7.5, mass: weight });

  const time = useTime();
  const y = useTransform(
    () => lag.get() + Math.sin(time.get() / (1500 * weight) + phase) * 5 * weight,
  );
  const x = useTransform(time, (t) => Math.cos(t / (2300 * weight) + phase) * 3);
  const rotate = useTransform(
    () =>
      clamp(lag.get() * 0.02, 1.2) * (index % 2 ? -1 : 1) +
      Math.sin(time.get() / (2900 * weight) + phase) * 0.35,
  );

  return (
    <motion.div
      style={reduceMotion ? undefined : { x, y, rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Dot on the spine that lights up as the reader reaches it. */
export function SpineNode({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "start 0.5"] });

  return (
    <span
      ref={ref}
      aria-hidden
      className={`absolute top-1.5 left-0 size-2 -translate-x-1/2 rounded-full border border-white/25 bg-black ${className}`}
    >
      <motion.span
        style={{ opacity: scrollYProgress, scale: scrollYProgress }}
        className="absolute -inset-px rounded-full bg-white shadow-[0_0_10px_2px_rgb(255_255_255/0.45)]"
      />
    </span>
  );
}

/** Timeline list with a spine that fills in as the reader scrolls through it. */
export function TimelineTrack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end 0.6"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const beadTop = useTransform(progress, (p) => `${p * 100}%`);
  const beadOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  return (
    <ol ref={ref} className="relative">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent md:left-1/2"
      >
        <motion.span
          style={{ scaleY: progress }}
          className="absolute inset-0 origin-top bg-gradient-to-b from-white/5 via-white/40 to-white/70"
        />
        <motion.span
          style={{ top: beadTop, opacity: beadOpacity }}
          className="absolute left-1/2 size-1.5 -translate-1/2 rounded-full bg-white shadow-[0_0_16px_4px_rgb(255_255_255/0.35)]"
        />
      </span>
      {children}
    </ol>
  );
}
