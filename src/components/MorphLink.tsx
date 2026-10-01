"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import type { ReactNode } from "react";

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

/**
 * Inline link whose text folds away into a glyph on hover. The word keeps its
 * box, so the paragraph around it never reflows. Touch devices skip the hover
 * and just follow the link.
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
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : spring;
  const external = !href.startsWith("#");

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      initial="rest"
      animate="rest"
      whileHover="hover"
      className="relative inline-grid cursor-pointer place-items-center rounded-sm text-white/90 underline decoration-white/20 underline-offset-4 transition-colors before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60 active:scale-[0.98]"
    >
      <motion.span
        className="[grid-area:1/1]"
        variants={{
          rest: { opacity: 1, scaleX: 1, filter: "blur(0px)" },
          hover: { opacity: 0, scaleX: 0.3, filter: "blur(3px)" },
        }}
        transition={transition}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none [grid-area:1/1]"
        variants={{
          rest: { opacity: 0, scale: 0.4 },
          hover: { opacity: 1, scale: 1 },
        }}
        transition={transition}
      >
        {glyph}
      </motion.span>
    </motion.a>
  );
}
