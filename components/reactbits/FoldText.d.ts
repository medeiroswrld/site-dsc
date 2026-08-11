import type { CSSProperties } from "react";

/**
 * Types for the JavaScript component next door. Declaring them here keeps
 * FoldText.jsx byte-identical to upstream — it can be re-pulled and diffed
 * without losing the typing the rest of this codebase relies on.
 */
export interface FoldTextProps {
  text?: string;
  splitBy?: "char" | "word" | "line";
  hinge?: "top" | "bottom" | "left" | "right";
  duration?: number;
  stagger?: number;
  ease?: string;
  perspective?: number;
  /** 0–1. Strength of the shading gradient while a panel is still folded. */
  creaseShading?: number;
  trigger?: "mount" | "hover" | "scroll" | "loop";
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

declare const FoldText: (props: FoldTextProps) => JSX.Element;
export default FoldText;
