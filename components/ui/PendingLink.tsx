"use client";

import Link, { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/**
 * A link that admits it is working.
 *
 * Navigation in this app can take a beat — a route compiling in development, a
 * database read in production — and a button that looks identical before and
 * after the click reads as broken. `useLinkStatus` gives us the pending state
 * from the moment the click lands, so feedback is immediate rather than
 * arriving with the next page.
 */
export function PendingLink({
  href,
  children,
  className,
  prefetch,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={className} prefetch={prefetch} {...rest}>
      {children}
      <PendingDot />
    </Link>
  );
}

/**
 * Must live inside the <Link> — `useLinkStatus` reads the status from the
 * nearest link ancestor.
 */
function PendingDot() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden={!pending}
      className={cn(
        "pointer-events-none -my-1 grid place-items-center overflow-hidden transition-[width,opacity] duration-200 ease-[var(--ease-out-quart)]",
        pending ? "w-4 opacity-100" : "w-0 opacity-0",
      )}
    >
      <Spinner />
      <span className="sr-only">{pending ? "Carregando…" : ""}</span>
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 animate-spin", className)}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
