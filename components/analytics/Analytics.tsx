"use client";

import Script from "next/script";
import { useEffect } from "react";
import {
  ADS_CONVERSION_ID,
  GA_MEASUREMENT_ID,
  analyticsEnabled,
  trackConversion,
} from "@/lib/analytics";

/**
 * Carrega o gtag e mede os contatos.
 *
 * Um único carregador com vários `config` — é assim que GA4 e Google Ads
 * convivem. Carregar o script duas vezes duplica evento e é o erro mais comum
 * quando as duas contas entram em momentos diferentes.
 *
 * `lazyOnload` e não `afterInteractive`: o gtag.js são 165 kB servidos pelo
 * Google, e com `afterInteractive` eles disputavam banda com a imagem do topo
 * numa conexão de celular. Medir não é o que o visitante veio fazer — o script
 * espera a página terminar de carregar.
 *
 * O custo é perder quem sai em menos de dois segundos. Numa loja de seminovos
 * essa visita não vira contato de qualquer forma, e a troca compensa: o site
 * aparece antes para quem fica.
 *
 * De qualquer estratégia, o gtag fica fora do HTML do servidor — é injetado
 * depois. Procurar por "gtag" no código-fonte não encontra nada, e isso é
 * esperado.
 */
export function Analytics() {
  useConversionTracking();

  if (!analyticsEnabled()) return null;

  return (
    <>
      <Script
        id="gtag-loader"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="gtag-config" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          ${ADS_CONVERSION_ID ? `gtag('config', '${ADS_CONVERSION_ID}');` : ""}
        `}
      </Script>
    </>
  );
}

/**
 * Um ouvinte só, no documento, em vez de um `onClick` em cada link.
 *
 * Os botões de WhatsApp e telefone estão espalhados por oito componentes — no
 * cabeçalho, no menu, no botão flutuante, na barra do celular, na página de
 * cada veículo, na localização e no fim dos formulários. Instrumentar um por
 * um seria oito arquivos hoje e um esquecimento no nono amanhã.
 *
 * Delegação também preserva a exigência de manter tudo como `<a>` de verdade:
 * sem JavaScript, o link continua levando ao WhatsApp.
 */
function useConversionTracking() {
  useEffect(() => {
    if (!analyticsEnabled()) return;

    function onClick(event: MouseEvent) {
      const alvo = (event.target as HTMLElement | null)?.closest?.("a");
      if (!alvo) return;

      const href = alvo.getAttribute("href") ?? "";
      const evento = href.startsWith("https://wa.me/")
        ? "whatsapp"
        : href.startsWith("tel:")
          ? "telefone"
          : null;
      if (!evento) return;

      const params = {
        origem: window.location.pathname,
        destino: href,
      };

      // Abrir em outra aba não tira esta página do ar, então o beacon tem
      // tempo de sair sozinho: segurar o clique aqui só atrasaria a abertura.
      const novaAba =
        alvo.getAttribute("target") === "_blank" ||
        event.metaKey ||
        event.ctrlKey ||
        event.button === 1;

      if (novaAba) {
        trackConversion(evento, params);
        return;
      }

      // Mesma aba: a navegação é adiada até o evento partir, senão o celular
      // troca de contexto antes da requisição e a conversão se perde.
      event.preventDefault();
      trackConversion(evento, params, () => {
        window.location.href = href;
      });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
