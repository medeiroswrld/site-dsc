import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { getStoreInfo } from "@/lib/site-content-repository";
import { formatAddress } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: `Como a ${siteConfig.name} trata os dados enviados pelos formulários e canais de contato do site.`,
  alternates: { canonical: "/politica-de-privacidade" },
  robots: { index: true, follow: true },
};

/**
 * Describes only what the site actually does today: it collects the fields in
 * its three forms and hands them to the store's WhatsApp. No analytics, no
 * advertising pixels, no cookies beyond what Next.js needs to serve the page —
 * so there is no cookie banner either.
 *
 * TO UPDATE: if analytics or a remarketing pixel is added later, this page and
 * a consent mechanism both need revisiting.
 */
const sections = [
  {
    title: "Quais dados são coletados",
    paragraphs: [
      "O site coleta apenas os dados que você digita nos formulários: nome, telefone/WhatsApp, veículo de interesse, informações sobre o carro que você quer vender ou trocar e a mensagem que você escrever.",
      "Não há cadastro, login ou área restrita. Nenhum dado é coletado automaticamente sobre a sua navegação para fins de publicidade.",
    ],
  },
  {
    title: "Para que os dados são usados",
    paragraphs: [
      "As informações são usadas exclusivamente para que a equipe da D.S.C. Seminovos entre em contato sobre a sua solicitação — responder dúvidas sobre um veículo, apresentar condições de financiamento ou avaliar um carro para venda ou troca.",
      "Os dados não são vendidos, alugados ou compartilhados com terceiros para fins comerciais.",
    ],
  },
  {
    title: "Como os dados são enviados",
    paragraphs: [
      "Ao enviar um formulário, você é direcionado para uma conversa no WhatsApp já preenchida com as informações que digitou. O envio da mensagem depende da sua confirmação no aplicativo, e o conteúdo trafega pela infraestrutura do WhatsApp, sujeita aos termos e à política de privacidade da plataforma.",
    ],
  },
  {
    title: "Por quanto tempo os dados ficam guardados",
    paragraphs: [
      "As conversas ficam registradas no WhatsApp da loja pelo tempo necessário ao atendimento e ao histórico comercial. Você pode pedir a exclusão a qualquer momento pelos canais de contato abaixo.",
    ],
  },
  {
    title: "Cookies",
    paragraphs: [
      "O site não utiliza cookies de rastreamento, de publicidade ou de análise de audiência. São usados apenas os recursos técnicos necessários para as páginas funcionarem.",
    ],
  },
  {
    title: "Seus direitos (LGPD)",
    paragraphs: [
      "Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a confirmação do tratamento, o acesso, a correção, a portabilidade ou a exclusão dos seus dados, além de revogar o consentimento dado ao enviar um formulário.",
      "Para exercer qualquer um desses direitos, use os canais de contato indicados abaixo.",
    ],
  },
];

export default async function PrivacyPolicyPage() {
  const store = await getStoreInfo();
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Política de Privacidade"
        description={`Como a ${siteConfig.name} trata as informações enviadas pelo site.`}
      />

      <Container size="wide" className="pb-16 lg:pb-20">
        <div className="max-w-2xl">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className={index === 0 ? "" : "mt-10"}
            >
              <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.022em] text-fg">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-[1.0625rem] leading-relaxed text-fg-muted"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section className="mt-12 border-t border-line pt-8">
            <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.022em] text-fg">
              Contato
            </h2>
            <address className="mt-3 not-italic text-[1.0625rem] leading-relaxed text-fg-muted">
              {siteConfig.name}
              <br />
              {formatAddress(store)}
              <br />
              <a
                href={`tel:${store.phoneE164}`}
                className="plate underline-offset-4 hover:underline"
              >
                {store.phoneDisplay}
              </a>
            </address>

            {/* TO COMPLETE: add the razão social, CNPJ and an e-mail for data
                requests once the store supplies them. */}
          </section>
        </div>
      </Container>
    </>
  );
}
