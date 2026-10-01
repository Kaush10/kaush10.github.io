"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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
    <div
      ref={ref}
      style={{
        transformOrigin: anchor === "end" ? "right center" : "left center",
      }}
    >
      {children}
    </div>
  );
}

// The light that travels down the spine dims as it goes: full white at the
// first entry, down to LIGHT_END at the last. Positions are fractions of the
// track's height, so adding entries spreads the same fade over more of them.
const LIGHT_TOP = [255, 255, 255];
const LIGHT_END = [92, 92, 98];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** The light's colour and glow at fraction `t` (0 top, 1 bottom) of the track. */
export function lightAt(t: number) {
  const k = Math.min(1, Math.max(0, t));
  const [r, g, b] = LIGHT_TOP.map((v, i) =>
    Math.round(mix(v, LIGHT_END[i], k)),
  );
  return {
    color: `rgb(${r} ${g} ${b})`,
    glow: `0 0 ${mix(18, 6, k).toFixed(1)}px ${mix(4, 1, k).toFixed(1)}px rgb(255 255 255 / ${mix(0.45, 0.07, k).toFixed(3)})`,
  };
}

/**
 * Dot on the spine that lights up as the reader reaches it, in the colour the
 * travelling light has at that point (so lower dots light dimmer). Its entry
 * stays dim until then and comes up with it.
 */
export function SpineNode({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [at, setAt] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "start 0.5"],
  });

  // Where this dot sits along the track, re-measured whenever the track's size changes.
  useEffect(() => {
    const node = ref.current;
    const list = node?.closest("ol[data-track]");
    if (!node || !list) return;
    const measure = () => {
      const n = node.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      setAt(l.height ? (n.top + n.height / 2 - l.top) / l.height : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // The entry this dot belongs to (its <li>) lights with it: --lit goes 0→1
  // as the dot does, and `.entry-dim` in globals.css reads it.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    ref.current?.parentElement?.style.setProperty("--lit", v.toFixed(3));
  });
  useEffect(() => {
    ref.current?.parentElement?.style.setProperty(
      "--lit",
      scrollYProgress.get().toFixed(3),
    );
  }, [scrollYProgress]);

  const light = lightAt(at);

  return (
    <span
      ref={ref}
      aria-hidden
      className={`absolute top-1.5 left-0 size-2 -translate-x-1/2 rounded-full border border-white/25 bg-black ${className}`}
    >
      <motion.span
        style={{
          opacity: scrollYProgress,
          scale: scrollYProgress,
          backgroundColor: light.color,
          boxShadow: light.glow,
        }}
        className="absolute -inset-px rounded-full"
      />
    </span>
  );
}

/**
 * Timeline list with a spine that fills in as the reader scrolls through it.
 * A light rides the leading edge, dimming from the top of the track to the bottom.
 */
export function TimelineTrack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.6", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const beadTop = useTransform(progress, (p) => `${p * 100}%`);
  const beadOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const beadColor = useTransform(progress, (p) => lightAt(p).color);
  const beadGlow = useTransform(progress, (p) => lightAt(p).glow);
  // The lit part of the spine is one gradient over the whole track, revealed
  // from the top, so each point keeps the brightness of the light that passed it.
  const filled = useTransform(
    progress,
    (p) => `inset(0 0 ${(1 - p) * 100}% 0)`,
  );

  return (
    <ol ref={ref} data-track className="relative">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-gradient-to-b from-white/10 via-white/[0.06] to-transparent md:left-1/2"
      >
        <motion.span
          style={{ clipPath: filled }}
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(255_255_255/0.7),rgb(255_255_255/0.35)_45%,rgb(92_92_98/0.3))]"
        />
        <motion.span
          style={{
            top: beadTop,
            opacity: beadOpacity,
            backgroundColor: beadColor,
            boxShadow: beadGlow,
          }}
          className="absolute left-1/2 size-1.5 -translate-1/2 rounded-full"
        />
      </span>
      {children}
    </ol>
  );
}
