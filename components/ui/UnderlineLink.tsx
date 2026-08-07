import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface UnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  /** Opens in a new tab and marks the link as leaving the site. */
  external?: boolean;
  /** An icon that reads before the label, e.g. the Instagram glyph. */
  leading?: React.ReactNode;
  arrow?: boolean;
  className?: string;
}

/**
 * The site's standalone text link: label on a rule, arrow that steps forward
 * on hover, rule warming to the brand orange.
 *
 * The rule hugs the text while the anchor itself carries vertical padding, so
 * the tap target clears 40px without the underline drifting away from the
 * words.
 */
export function UnderlineLink({
  href,
  children,
  external,
  leading,
  arrow = true,
  className,
}: UnderlineLinkProps) {
  const content = (
    <>
      {leading}
      <span className="border-b border-line-strong pb-1.5 transition-colors duration-200 group-hover:border-brand">
        {children}
      </span>
      {arrow && (
        <ArrowRight className="text-[1rem] transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-1" />
      )}
    </>
  );

  const classes = cn(
    "group inline-flex items-center gap-2.5 py-2 text-[0.9375rem] text-fg",
    "transition-colors duration-200 hover:text-brand-text",
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
