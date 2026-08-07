import { Reveal } from "@/components/motion/Reveal";
import { MapPin, Phone, WhatsApp } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { fullAddress, mapsDirectionsUrl, mapsEmbedUrl, siteConfig } from "@/lib/site";
import { whatsappVisitLink } from "@/lib/whatsapp";

export function LocationSection() {
  return (
    <section
      className="bg-surface py-20 lg:py-24"
      aria-labelledby="localizacao-titulo"
    >
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">Localização</p>
              <h2 id="localizacao-titulo" className="display-3 mt-4">
                Venha conhecer a loja
              </h2>
            </Reveal>

            <Reveal delay={0.06}>
              <address className="mt-7 not-italic">
                <p className="flex gap-3 text-[1.0625rem] leading-relaxed text-fg-muted">
                  <MapPin className="mt-1 shrink-0 text-[1.125rem] text-fg-subtle" />
                  <span>
                    {siteConfig.address.street}
                    <br />
                    {siteConfig.address.neighbourhood}
                    <br />
                    {siteConfig.address.city} - {siteConfig.address.state},{" "}
                    {siteConfig.address.postalCode}
                  </span>
                </p>

                <p className="mt-3 flex items-center gap-3">
                  <Phone className="shrink-0 text-[1.125rem] text-fg-subtle" />
                  <a
                    href={`tel:${siteConfig.phone.e164}`}
                    className="plate inline-block py-2 text-[1.0625rem] text-fg underline-offset-4 hover:underline"
                  >
                    {siteConfig.phone.display}
                  </a>
                </p>
              </address>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-7 border-t border-line">
                {siteConfig.hours.map((entry) => (
                  <div
                    key={entry.days}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                  >
                    <dt className="text-[0.9375rem] text-fg-muted">{entry.days}</dt>
                    <dd className="plate text-[0.875rem] text-fg-subtle">
                      {entry.time}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-md"
                >
                  Traçar rota
                </a>
                <a
                  href={`tel:${siteConfig.phone.e164}`}
                  className="btn btn-secondary btn-md"
                >
                  <Phone className="text-[1rem]" />
                  Ligar
                </a>
                <a
                  href={whatsappVisitLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-md"
                >
                  <WhatsApp className="text-[1rem]" />
                  WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 sm:aspect-[16/10] lg:aspect-[4/3.2]">
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa com a localização da ${siteConfig.name} — ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
