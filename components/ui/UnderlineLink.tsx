import Link from "next/link";
import { cn } from "@/lib/utils";

interface UnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  /** Opens in a new tab and marks the link as leaving the site. */
  external?: boolean;
  /** An icon that reads before the label, e.g. the Instagram glyph. */
  leading?: React.ReactNode;
  className?: string;
}

/**
 * The site's standalone text link: a label on a rule that warms to the brand
 * colour on hover.
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
  className,
}: UnderlineLinkProps) {
  const content = (
    <>
      {leading}
      <span className="border-b border-line-strong pb-1.5 transition-colors duration-200 group-hover:border-brand">
        {children}
      </span>
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
