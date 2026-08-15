import { formatPrice, formatYear, vehicleTitle } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { Vehicle } from "@/types/vehicle";

/**
 * Every WhatsApp link is built here so no conversation ever starts with a bare
 * "olá, gostaria de saber mais" — the team must always know which page or
 * which car produced the lead.
 */

/**
 * The number is a parameter with a default rather than a direct read, because
 * the store can change it from the panel. Callers that have the current value
 * pass it in; the ones that do not still produce a working link.
 */
function buildLink(message: string, number: string = siteConfig.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** General enquiry, used by the floating button and the site-wide CTAs. */
export function whatsappGeneralLink(context?: string, number?: string): string {
  const base = `Olá! Vim pelo site da ${siteConfig.name}`;
  return buildLink(
    context
      ? `${base} (${context}) e gostaria de falar com a equipe.`
      : `${base} e gostaria de falar com a equipe.`,
    number,
  );
}

/** Vehicle enquiry — names the exact car, year and price the visitor saw. */
export function whatsappVehicleLink(vehicle: Vehicle, number?: string): string {
  const lines = [
    `Olá! Vi o ${vehicleTitle(vehicle)} ${formatYear(vehicle)} no site da ${siteConfig.name} e gostaria de mais informações.`,
  ];

  if (vehicle.price !== null) {
    lines.push(`Anunciado por ${formatPrice(vehicle.price)}.`);
  }

  lines.push(`${siteConfig.url}/estoque/${vehicle.slug}`);

  return buildLink(lines.join("\n\n"), number);
}

/** Financing enquiry started from a specific vehicle page. */
export function whatsappFinanceLink(vehicle?: Vehicle, number?: string): string {
  if (!vehicle) {
    return buildLink(
      `Olá! Gostaria de simular o financiamento de um veículo da ${siteConfig.name}.`,
      number,
    );
  }

  return buildLink(
    `Olá! Gostaria de simular o financiamento do ${vehicleTitle(vehicle)} ${formatYear(vehicle)} anunciado no site da ${siteConfig.name}.`,
    number,
  );
}

/** Trade-in / sale enquiry. */
export function whatsappSellCarLink(number?: string): string {
  return buildLink(
    `Olá! Quero vender ou usar meu carro na troca e gostaria de uma avaliação da ${siteConfig.name}.`,
    number,
  );
}

/** Visit enquiry, used by the location section. */
export function whatsappVisitLink(number?: string): string {
  return buildLink(
    `Olá! Gostaria de combinar uma visita à loja da ${siteConfig.name} em ${siteConfig.city}.`,
    number,
  );
}
