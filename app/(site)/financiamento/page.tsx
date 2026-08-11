import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getAllVehicles } from "@/lib/vehicles-repository";

export const metadata: Metadata = {
  title: "Financiamento de seminovos",
  description: `Solicite uma simulação de financiamento na ${siteConfig.name}, em ${siteConfig.city} - ${siteConfig.state}. Informe o veículo de interesse e a equipe entra em contato.`,
  alternates: { canonical: "/financiamento" },
};

/**
 * No simulator. Rates, terms and approval depend on the bank and on the
 * buyer's profile, and publishing an invented instalment would set an
 * expectation the store cannot honour. The page captures intent instead.
 */
export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ veiculo?: string }>;
}) {
  const [{ veiculo }, vehicles] = await Promise.all([
    searchParams,
    getAllVehicles(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Financiamento"
        title="Quer financiar? Envie seus dados e fale com a equipe."
        description="Informe o veículo de interesse e alguns dados básicos. A equipe da D.S.C. entra em contato para apresentar as possibilidades disponíveis."
      />

      <Container size="wide" className="pb-24 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7 xl:col-span-7">
            <FinanceForm vehicles={vehicles} preselectedSlug={veiculo} />
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <div className="rounded-2xl border border-line bg-surface p-6 lg:p-7">
              <h2 className="font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
                Como funciona
              </h2>

              <ol className="mt-5 border-t border-line">
                {[
                  {
                    title: "Você envia os dados",
                    body: "Veículo de interesse, contato e, se quiser, o valor que pretende dar de entrada.",
                  },
                  {
                    title: "A equipe consulta as condições",
                    body: "A simulação é feita com base no seu perfil e no veículo escolhido.",
                  },
                  {
                    title: "O retorno vem pelo WhatsApp",
                    body: "Você recebe as possibilidades disponíveis e decide sem compromisso.",
                  },
                ].map((item, index) => (
                  <li
                    key={item.title}
                    className="flex gap-4 border-b border-line py-4"
                  >
                    <span className="plate shrink-0 text-[0.6875rem] text-fg-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[0.9375rem] font-medium text-fg">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[0.875rem] leading-relaxed text-fg-subtle">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-5 text-[0.8125rem] leading-relaxed text-fg-subtle">
                Taxas, prazos e aprovação dependem da análise da instituição
                financeira e do perfil de cada cliente. Por isso a simulação é
                feita pela equipe, e não automaticamente pelo site.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Financiamento", path: "/financiamento" },
        ])}
      />
    </>
  );
}
