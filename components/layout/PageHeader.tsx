import { HeaderOffset } from "@/components/layout/Header";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Sits opposite the title on wide screens: a count, a rating, a link. */
  aside?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  className,
}: PageHeaderProps) {
  return (
    <>
      <HeaderOffset />
      <section className={cn("bg-bg pb-9 pt-10 lg:pb-12 lg:pt-16", className)}>
        <Container size="wide">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <div className="max-w-3xl">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="display-1 mt-4 max-w-[20ch]">{title}</h1>
              {description && (
                <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
