import { cn } from "@/lib/utils";

/**
 * The hero headline, folding in word by word — in CSS, with no JavaScript.
 *
 * It replaces the GSAP-driven FoldText on this one element, for two reasons
 * found while profiling.
 *
 * The first is weight: this is the only thing above the fold that needed GSAP,
 * so ~73 kB of animation engine sat on the critical path of the page's largest
 * element. The carousel that also uses GSAP now loads on approach, which means
 * dropping it here takes it off the first load entirely.
 *
 * The second is a flash. GSAP applied the starting `opacity: 0` at runtime, so
 * the browser painted the finished headline, then hid it, then folded it back
 * in. CSS sets the starting state before the first paint, so the animation
 * begins where it should.
 *
 * The words are real text in the markup — split into spans, never into
 * characters — so selection, search and screen readers see one sentence.
 */
export function FoldHeading({
  text,
  className,
  /** Seconds between each word starting. */
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  stagger?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("fold-heading", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="fold-heading__word"
          style={{ animationDelay: `${(index * stagger).toFixed(3)}s` }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
