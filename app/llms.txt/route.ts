import { formatMileage, formatPrice, formatYear, vehicleTitle } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { formatAddress } from "@/lib/site-content";
import { getStoreInfo } from "@/lib/site-content-repository";
import { getAllVehicles } from "@/lib/vehicles-repository";

/**
 * /llms.txt — a plain-language summary of the shop for language models.
 *
 * The convention (llmstxt.org) asks for one markdown file at the root: a
 * heading, a one-line summary, then linked sections. It is a proposal, not a
 * standard anyone is obliged to read, and no model provider has said it
 * affects what they recommend. What it does do is give a crawler the facts in
 * one request instead of making it infer them from markup — which is cheap
 * enough to be worth doing while the convention settles.
 *
 * Generated from the same database the pages use, so the stock and the prices
 * here are the ones on the site. A file typed by hand would be wrong within a
 * week, and a confidently wrong price is worse than no file.
 */
export const revalidate = 3600;

export async function GET() {
  const [store, vehicles] = await Promise.all([getStoreInfo(), getAllVehicles()]);

  const available = vehicles.filter((vehicle) => vehicle.status === "available");
  const hours = store.hours.map((entry) => `${entry.days}: ${entry.time}`).join(" | ");

  const stock = available.length
    ? available
        .map(
          (vehicle) =>
            `- [${vehicleTitle(vehicle)} ${formatYear(vehicle)}](${siteConfig.url}/estoque/${vehicle.slug}): ` +
            `${formatPrice(vehicle.price)}, ${formatMileage(vehicle.mileage)}, ` +
            `${vehicle.transmission.toLowerCase()}, ${vehicle.fuel.toLowerCase()}`,
        )
        .join("\n")
    : "- Nenhum veículo disponível no momento.";

  const body = `# ${siteConfig.name}

> Loja de carros seminovos em ${siteConfig.city}, no interior de ${siteConfig.stateName}. Veículos selecionados, financiamento e atendimento direto da equipe.

A ${siteConfig.name} atua há ${store.foundedYearsText} em ${siteConfig.city} e região.
A negociação, a documentação e o atendimento acontecem no escritório próprio, no
mesmo endereço da loja. O contato preferido dos clientes é o WhatsApp.

## Dados da loja

- Endereço: ${formatAddress(store)}
- Telefone: ${store.phoneDisplay}
- WhatsApp: https://wa.me/${store.whatsapp}
- Horários: ${hours}
- Instagram: ${store.instagramUrl}
- Avaliação no Google: ${store.ratingValue} de 5, com ${store.ratingCount} avaliações

## Páginas

- [Início](${siteConfig.url}/): apresentação da loja e veículos em destaque
- [Estoque](${siteConfig.url}/estoque): todos os veículos disponíveis, com filtros por marca, modelo, ano, preço e quilometragem
- [Financiamento](${siteConfig.url}/financiamento): simulação de financiamento; a equipe consulta as condições e responde pelo WhatsApp
- [Venda seu carro](${siteConfig.url}/venda-seu-carro): avaliação para quem quer vender ou dar o carro na troca
- [A D.S.C.](${siteConfig.url}/sobre): história e estrutura da loja
- [Contato](${siteConfig.url}/contato): endereço, telefone, horários e mapa
- [Política de Privacidade](${siteConfig.url}/politica-de-privacidade): tratamento dos dados enviados pelos formulários

## Estoque disponível

Preços e disponibilidade mudam com frequência; a página de cada veículo é a
fonte atual. Veículos vendidos saem desta lista.

${stock}

## Observações

- A loja não realiza serviços de oficina mecânica.
- Preço "Sob consulta" significa que o valor não foi publicado, não que seja negociável por padrão.
- Este arquivo é gerado automaticamente a partir do banco de dados do site.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
