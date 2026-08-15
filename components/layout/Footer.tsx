import Link from "next/link";
import { Wordmark } from "@/components/layout/Wordmark";
import { Container } from "@/components/ui/Container";
import { Instagram } from "@/components/ui/icons";
import { navigation, siteConfig } from "@/lib/site";
import { getStoreInfo } from "@/lib/site-content-repository";
import { formatAddress, mapsDirections, mapsEmbed } from "@/lib/site-content";

export async function Footer() {
  const store = await getStoreInfo();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface">
      <Container size="wide">
        <div className="grid gap-12 pb-14 pt-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-20">
          <div className="lg:col-span-4">
            <Wordmark />
            <p className="mt-5 max-w-xs text-[0.875rem] leading-relaxed text-fg-subtle">
              Loja de seminovos em {siteConfig.city}, {siteConfig.stateName}.
              Veículos selecionados, oficina própria e atendimento direto da
              equipe.
            </p>
          </div>

          <nav aria-label="Rodapé" className="lg:col-span-3">
            <h2 className="plate text-[0.625rem] uppercase tracking-[0.16em] text-fg-subtle">
              Navegação
            </h2>
            <ul className="mt-5 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.9375rem] text-fg-muted transition-colors duration-200 hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="plate text-[0.625rem] uppercase tracking-[0.16em] text-fg-subtle">
              Contato
            </h2>
            <address className="mt-5 space-y-3 not-italic">
              <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
                {store.street}
                <br />
                {store.neighbourhood}
                <br />
                {store.city} - {store.state},{" "}
                {store.postalCode}
              </p>
              <p>
                <a
                  href={`tel:${store.phoneE164}`}
                  className="plate inline-block py-2 text-[0.9375rem] text-fg transition-opacity duration-200 hover:opacity-70"
                >
                  {store.phoneDisplay}
                </a>
              </p>
            </address>

            <dl className="mt-6 space-y-1.5">
              <dt className="plate text-[0.625rem] uppercase tracking-[0.16em] text-fg-subtle">
                Horários
              </dt>
              {store.hours.map((entry) => (
                <dd
                  key={entry.days}
                  className="flex flex-wrap gap-x-2 text-[0.8125rem] text-fg-muted"
                >
                  <span>{entry.days}</span>
                  <span className="plate">{entry.time}</span>
                </dd>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-2">
            <h2 className="plate text-[0.625rem] uppercase tracking-[0.16em] text-fg-subtle">
              Instagram
            </h2>
            <a
              href={store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center gap-2 py-2 text-[0.9375rem] text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              <Instagram className="text-[1.125rem]" />
              {store.instagramHandle}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="plate text-[0.6875rem] text-fg-subtle">
            © {year} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link
                href="/politica-de-privacidade"
                className="text-[0.8125rem] text-fg-subtle transition-colors duration-200 hover:text-fg"
              >
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link
                href="/contato"
                className="text-[0.8125rem] text-fg-subtle transition-colors duration-200 hover:text-fg"
              >
                Contato
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
