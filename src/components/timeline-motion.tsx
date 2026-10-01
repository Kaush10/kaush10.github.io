"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { float } from "@/components/fluid";

const DESKTOP = "(min-width: 768px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

/**
 * Floats its children in the page's fluid (see fluid.ts). Entries hang from
 * the spine, so a left-hand entry on desktop pivots around its right edge.
 */
export function FloatingEntry({
  index,
  side,
  children,
}: {
  index: number;
  side: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const anchor = side === "left" && isDesktop ? "end" : "start";

  useEffect(() => {
    if (!ref.current || reduceMotion) return;
    return float(ref.current, index, anchor);
  }, [index, anchor, reduceMotion]);

  return (
    <div ref={ref} style={{ transformOrigin: anchor === "end" ? "right center" : "left center" }}>
      {children}
    </div>
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
