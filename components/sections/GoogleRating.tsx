import { CountUp } from "@/components/motion/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Star } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { formatRating } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { getStoreInfo } from "@/lib/site-content-repository";
import { formatAddress, mapsDirections, mapsEmbed } from "@/lib/site-content";

/**
 * Reviews quoted verbatim from what the store supplied. Reviewer names were
 * not provided, so none are shown — an attributed quote we invented would be
 * worth less than an unattributed one that is true.
 */
const quotes = [
  "Vendedores atenciosos, se empenham em fazer acontecer a compra.",
  "Ótimo atendimento e preços!",
  "Equipe atenciosa, transparente e muito profissional.",
];

export async function GoogleRating() {
  const store = await getStoreInfo();

  const { ratingValue: value, ratingCount: count } = store;
  const scale = siteConfig.rating.scale;

  return (
    <section className="bg-surface py-16 lg:py-20" aria-labelledby="reputacao-titulo">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <h2 id="reputacao-titulo" className="eyebrow">
              Avaliações no Google
            </h2>

            <p className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[3.25rem] font-semibold leading-none tracking-[-0.04em] text-fg tnum">
                <CountUp to={value} decimals={1} />
              </span>
              <span className="plate text-[1rem] text-fg-subtle">/ {scale}</span>
            </p>

            <p
              className="mt-4 flex gap-1 text-brand-text"
              aria-label={`${formatRating(value)} de ${scale} estrelas`}
            >
              {Array.from({ length: scale }, (_, index) => (
                <Star
                  key={index}
                  fill={Math.max(0, Math.min(1, value - index))}
                  className="text-[1.0625rem]"
                />
              ))}
            </p>

            <p className="mt-4 text-[0.875rem] text-fg-subtle tnum">
              {count} avaliações no Google
            </p>

            <UnderlineLink
              href={store.googleReviewsUrl}
              external
              className="mt-4"
            >
              Ver avaliações no Google
            </UnderlineLink>
          </Reveal>

          <RevealGroup
            as="div"
            className="grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-t-0 lg:col-span-8"
          >
            {quotes.map((quote) => (
              <RevealItem key={quote} as="figure" className="py-6 sm:px-7 sm:py-1 sm:first:ps-0 sm:last:pe-0">
                <blockquote className="text-[1.0625rem] leading-relaxed text-fg-muted">
                  <span aria-hidden="true" className="text-fg-subtle">
                    “
                  </span>
                  {quote}
                  <span aria-hidden="true" className="text-fg-subtle">
                    ”
                  </span>
                </blockquote>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
