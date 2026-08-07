import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Shape, size and colour all live in globals.css as `.btn` primitives, so the
 * inline links scattered through the pages and this component stay identical
 * without duplicating a class list.
 */
type Variant = "primary" | "secondary" | "contrast" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  contrast: "btn-contrast",
  ghost: "text-fg-muted hover:text-fg",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /** Stretches to the container width — used inside forms and mobile bars. */
  block?: boolean;
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type AnchorProps = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href">;

function classesFor(
  variant: Variant,
  size: Size,
  block?: boolean,
  className?: string,
) {
  return cn(
    "btn",
    variants[variant],
    `btn-${size}`,
    block && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classesFor(variant, size, block, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  href,
  external,
  ...rest
}: AnchorProps) {
  const classes = classesFor(variant, size, block, className);

  if (external || href.startsWith("http") || href.startsWith("tel:")) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
