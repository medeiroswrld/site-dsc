import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, WhatsApp } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { whatsappVisitLink } from "@/lib/whatsapp";

interface FinalCTAProps {
  headline?: string;
  body?: string;
  /** Hidden when the visitor is already looking at the stock. */
  showStockLink?: boolean;
}

export function FinalCTA({
  headline = "Encontrou um carro que quer ver de perto?",
  body = "Fale com a D.S.C. e combine uma visita à loja.",
  showStockLink = true,
}: FinalCTAProps) {
  return (
    <section className="bg-surface py-20 lg:py-24">
      <Container size="wide">
        <Reveal className="flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-2xl">
            <h2 className="display-2 text-fg">{headline}</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-fg-muted">
              {body}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {showStockLink && (
              <Link
                href="/estoque"
                className="btn btn-primary btn-lg"
              >
                Ver estoque
                <ArrowRight className="text-[1rem] transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-1" />
              </Link>
            )}

            <a
              href={whatsappVisitLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <WhatsApp className="text-[1.125rem]" />
              Falar no WhatsApp
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
