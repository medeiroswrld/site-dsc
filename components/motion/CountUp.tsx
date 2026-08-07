"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

/**
 * Counts once, when the figure first enters the viewport. Reduced motion (and
 * the server render) get the final value immediately, so the number is never
 * wrong or missing for anyone.
 */
export function CountUp({
  to,
  decimals = 0,
  duration = 1.1,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (reduced) return;
    setValue(0);
  }, [reduced]);

  useEffect(() => {
    if (!inView || reduced) return;

    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setValue(latest),
    });

    return () => controls.stop();
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
