/**
 * Medição: GA4 hoje, Google Ads quando houver.
 *
 * Um lugar só para os IDs, porque eles reaparecem no carregador, em cada
 * `config` e em cada conversão — e um ID divergente entre esses pontos é um
 * erro que não aparece em teste nenhum, só em relatório vazio semanas depois.
 */

export const GA_MEASUREMENT_ID = "G-K5HMMGZVN9";

/**
 * ID do Google Ads e rótulos das conversões. Vazio por enquanto: a conta de
 * Ads ainda não foi informada. Preenchendo aqui, o disparo abaixo passa a
 * mandar para os dois destinos sem mais nenhuma mudança.
 */
export const ADS_CONVERSION_ID = "";
export const ADS_LABELS = {
  whatsapp: "",
  telefone: "",
} as const;

/**
 * Só mede em produção.
 *
 * Sem isto, cada `npm run dev` e cada preview da Vercel somaria visita ao
 * mesmo relatório — e um número inflado é pior que nenhum, porque parece
 * confiável. `NEXT_PUBLIC_VERCEL_ENV` é "production" apenas no domínio real;
 * preview e development têm valores próprios.
 */
export function analyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: GtagParams) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Dispara a conversão e só então segue viagem.
 *
 * O `event_callback` avisa quando o beacon saiu. Mas ele pode nunca ser
 * chamado — bloqueador de anúncio, rede caindo, gtag que não carregou — e
 * esperar para sempre significaria um link que não navega. Daí o backup por
 * tempo: o que acontecer primeiro vence, e `feito` garante que a navegação
 * ocorra uma vez só.
 *
 * Isso importa no celular: sem a espera, a aba troca antes de a requisição
 * partir e a conversão se perde. Com mais de um segundo, o usuário sente
 * travamento. Um segundo é o meio-termo de mercado.
 */
export function trackConversion(
  evento: "whatsapp" | "telefone",
  params: GtagParams,
  aoConcluir?: () => void,
): void {
  let feito = false;
  const seguir = () => {
    if (feito) return;
    feito = true;
    aoConcluir?.();
  };

  if (typeof window === "undefined" || !window.gtag) {
    seguir();
    return;
  }

  const nome = evento === "whatsapp" ? "contato_whatsapp" : "contato_telefone";
  window.gtag("event", nome, { ...params, event_callback: seguir });

  const rotulo = ADS_LABELS[evento];
  if (ADS_CONVERSION_ID && rotulo) {
    window.gtag("event", "conversion", {
      send_to: `${ADS_CONVERSION_ID}/${rotulo}`,
      event_callback: seguir,
    });
  }

  window.setTimeout(seguir, 1000);
}
