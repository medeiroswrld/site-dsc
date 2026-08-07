import Link from "next/link";
import { HeaderOffset } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { ArrowRight } from "@/components/ui/icons";
import { whatsappGeneralLink } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <>
      <HeaderOffset />
      <Container size="wide" className="py-24 lg:py-36">
        <div className="max-w-xl">
          <p className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
            Erro 404
          </p>
          <h1 className="display-2 mt-4">Esta página não existe.</h1>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-fg-muted">
            O endereço pode ter mudado, ou o veículo que você procurava já saiu
            do estoque. Veja o que está disponível agora ou fale com a equipe.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/estoque"
              className="btn btn-primary btn-lg"
            >
              Ver estoque
              <ArrowRight className="text-[1rem] transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappGeneralLink("página não encontrada")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}
