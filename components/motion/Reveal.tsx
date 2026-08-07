"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The site's two scroll gestures, and nothing else.
 *
 * `Reveal` moves content 18px and fades it in. `MediaReveal` settles a
 * photograph from a slight overscale. Both are transform/opacity only, so they
 * stay on the compositor, and both collapse to a plain fade when the visitor
 * has asked for reduced motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use sparingly — a long chain reads as a loading screen. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "figure";
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

/** Parent that hands a staggered delay to each `RevealItem` beneath it. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  as = "div",
}: RevealProps & { stagger?: number }) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </Component>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const itemVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.2 } },
};

export function RevealItem({
  children,
  className,
  as = "div",
}: Omit<RevealProps, "delay">) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={reduced ? itemVariantsReduced : itemVariants}
    >
      {children}
    </Component>
  );
}

/**
 * Photography settles into place from a slight overscale. The wrapper clips,
 * so nothing bleeds past the frame during the transition.
 */
export function MediaReveal({
  children,
  className,
  delay = 0,
}: Omit<RevealProps, "as">) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: reduced ? 0.2 : 0.9, ease: EASE, delay }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
