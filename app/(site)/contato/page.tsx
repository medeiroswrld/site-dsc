import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { LocationSection } from "@/components/sections/LocationSection";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { Instagram, Phone, WhatsApp } from "@/components/ui/icons";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { getStoreInfo } from "@/lib/site-content-repository";
import { formatAddress, type StoreInfo } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreInfo();
  const channels = buildChannels(store);
  return {
    title: "Contato e localização",
    description: `Fale com a ${siteConfig.name} em ${siteConfig.city} - ${siteConfig.state}. Endereço, telefone ${store.phoneDisplay}, WhatsApp e horários de atendimento.`,
    alternates: { canonical: "/contato" },
  };
}

function buildChannels(store: StoreInfo) {
  return [
  {
    label: "WhatsApp",
    value: "Resposta mais rápida",
    href: whatsappGeneralLink("página de contato", store.whatsapp),
    Icon: WhatsApp,
    external: true,
  },
  {
    label: "Telefone",
    value: store.phoneDisplay,
    href: `tel:${store.phoneE164}`,
    Icon: Phone,
    external: false,
  },
  {
    label: "Instagram",
    value: store.instagramHandle,
    href: store.instagramUrl,
    Icon: Instagram,
    external: true,
  },
  ];
}

export default async function ContactPage() {
  const store = await getStoreInfo();
  const channels = buildChannels(store);
  return (
    <>
      <PageHeader
        eyebrow="Contato"
        title="Fale com a equipe da D.S.C."
        description={`A loja fica na Vila Nastri, em ${siteConfig.city}. Escolha o canal que preferir ou mande a mensagem pelo formulário.`}
      />

      <Container size="wide" className="pb-20 lg:pb-24">
        <Reveal>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {channels.map(({ label, value, href, Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex h-full flex-col justify-between gap-6 bg-surface-2 p-6 transition-colors duration-200 hover:bg-surface-3"
                >
                  <Icon className="text-[1.375rem] text-fg-subtle transition-colors duration-200 group-hover:text-fg" />
                  <div>
                    <p className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                      {label}
                    </p>
                    <p className="mt-1.5 font-display text-[1.0625rem] font-semibold tracking-[-0.02em] text-fg">
                      {value}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="display-3">Mande uma mensagem</h2>
            <p className="mt-3 max-w-lg text-[1rem] leading-relaxed text-fg-muted">
              Preencha e a conversa abre no WhatsApp já com os seus dados
              escritos — é por lá que a equipe responde mais rápido.
            </p>
            <div className="mt-9">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <div className="rounded-2xl border border-line bg-surface p-6 lg:p-7">
              <h2 className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
                Horários de atendimento
              </h2>
              <dl className="mt-5 border-t border-line">
                {store.hours.map((entry) => (
                  <div
                    key={entry.days}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                  >
                    <dt className="text-[0.9375rem] text-fg-muted">{entry.days}</dt>
                    <dd className="plate text-[0.875rem] text-fg">
                      {entry.time}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[0.8125rem] leading-relaxed text-fg-subtle">
                Domingos e feriados a loja não abre. Mensagens no WhatsApp
                enviadas fora do horário são respondidas no expediente
                seguinte.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>

      <LocationSection />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Contato", path: "/contato" },
        ])}
      />
    </>
  );
}
