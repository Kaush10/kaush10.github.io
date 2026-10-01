"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { SpotlightContext } from "@/components/BioSpotlight";

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

// When the spotlight comes on, each link becomes its word as the light
// reaches it: top lines first, lower ones a beat later.
const REVEAL_START = 0.9; // s after the lamp catches
const REVEAL_SPREAD = 0.9; // s from the top of the bio to the bottom

/**
 * Inline link that's either its word or its glyph. In a spotlight it's a
 * glyph until the light reaches it, then the word. Hovering shows the glyph
 * again. The word keeps its box, so the paragraph around it never reflows.
 */
export function MorphLink({
  href,
  glyph,
  children,
}: {
  href: string;
  glyph: ReactNode;
  children: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const lit = useContext(SpotlightContext);
  const [reached, setReached] = useState(false);
  const revealed = lit && reached;
  const external = !href.startsWith("#");

  useEffect(() => {
    if (!lit) return;
    // Lower in the bio, later the light gets there.
    const node = ref.current;
    const area = node?.closest(".spot-text");
    let at = 0;
    if (node && area) {
      const a = area.getBoundingClientRect();
      const n = node.getBoundingClientRect();
      at = a.height ? (n.top - a.top) / a.height : 0;
    }
    const delay = reduceMotion || !area ? 0 : (REVEAL_START + at * REVEAL_SPREAD) * 1000;
    const timer = setTimeout(() => setReached(true), delay);
    // When the light goes off, the next time it comes on starts from glyphs again.
    return () => {
      clearTimeout(timer);
      setReached(false);
    };
  }, [lit, reduceMotion]);

  const transition = reduceMotion ? { duration: 0 } : spring;
  const word = { opacity: 1, scaleX: 1, filter: "blur(0px)" };
  const folded = { opacity: 0, scaleX: 0.3, filter: "blur(3px)" };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      initial={false}
      animate={revealed ? "word" : "glyph"}
      whileHover="glyph"
      className="relative inline-grid cursor-pointer place-items-center rounded-sm text-white/90 underline decoration-white/20 underline-offset-4 transition-colors before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60 active:scale-[0.98]"
    >
      <motion.span
        className="[grid-area:1/1]"
        variants={{ word, glyph: folded }}
        transition={transition}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none [grid-area:1/1]"
        variants={{ word: { opacity: 0, scale: 0.4 }, glyph: { opacity: 1, scale: 1 } }}
        transition={transition}
      >
        {glyph}
      </motion.span>
    </motion.a>
  );
}
