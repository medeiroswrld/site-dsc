import { cn } from "@/lib/utils";

/**
 * The D.S.C. lockup: silver lettering with the orange hatchback beside it.
 *
 * Built as markup rather than an <img> so the type renders in the site's own
 * display face, the lettering follows `currentColor`, and the mark stays
 * crisp at any size without a second network request.
 *
 * The car is redrawn as vector from the store's profile picture. Swap
 * /public/brand/logo-mark.svg — or this path — for the original artwork when
 * it is available; the proportions already match.
 */
export function Wordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5 sm:gap-3", className)}>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.9375rem] font-medium leading-none tracking-[0.16em] sm:text-[1.0625rem]">
          D.S.C
        </span>
        <span
          className={cn(
            "font-display text-[0.5rem] font-bold uppercase leading-none tracking-[0.2em] sm:text-[0.5625rem] sm:tracking-[0.22em]",
            "mt-[0.3rem] text-fg-subtle",
            compact && "hidden sm:block",
          )}
        >
          Seminovos
        </span>
      </span>

      <CarMark className="h-[1.6rem] w-auto shrink-0 sm:h-[1.85rem]" />
    </span>
  );
}

/** The hatchback on its own — also used as the site icon. */
export function CarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 250 104"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M26 54 C26 38 38 28 58 25 L124 22 C141 21 153 27 162 37 L176 54 Z"
        fill="var(--color-brand)"
      />
      <path d="M40 50 C40 41 48 35 61 33 L76 32 L76 50 Z" fill="var(--color-bg)" />
      <path
        d="M85 32 L122 30 C133 29 142 33 149 41 L157 50 L85 50 Z"
        fill="var(--color-bg)"
      />
      <g
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M176 54 C200 57 220 64 234 74" />
        <path d="M27 54 C21 63 25 78 38 78 L48 78 A22 22 0 0 1 92 78 L152 78 A22 22 0 0 1 196 78 L216 78 L234 74" />
      </g>
    </svg>
  );
}
