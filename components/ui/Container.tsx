import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** `wide` keeps the outer gutter but drops the reading-width ceiling. */
  size?: "default" | "wide" | "narrow";
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
}

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-[86rem]",
  wide: "max-w-[110rem]",
} as const;

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
