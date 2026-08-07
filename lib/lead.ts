import { siteConfig } from "@/lib/site";

/**
 * Lead handling.
 *
 * There is no CRM behind the site yet, so a submitted form hands the visitor
 * to WhatsApp with every field they filled in already written out. That is a
 * real destination the team already watches — not a button that pretends to
 * send something.
 *
 * INTEGRATION POINT — when a backend exists:
 *   1. Add `app/api/leads/route.ts` accepting the `Lead` shape below.
 *   2. POST to it inside `submitLead` before returning the WhatsApp URL.
 *   3. Keep the WhatsApp handoff: it is the conversion, not a fallback.
 */

export type LeadKind = "financiamento" | "venda" | "contato";

export interface Lead {
  kind: LeadKind;
  fields: Array<{ label: string; value: string }>;
}

const kindHeadings: Record<LeadKind, string> = {
  financiamento: "Solicitação de simulação de financiamento",
  venda: "Avaliação de veículo para venda ou troca",
  contato: "Contato pelo site",
};

export function buildLeadMessage(lead: Lead): string {
  const lines = [
    `*${kindHeadings[lead.kind]}* — site da ${siteConfig.name}`,
    "",
    ...lead.fields
      .filter((field) => field.value.trim().length > 0)
      .map((field) => `${field.label}: ${field.value.trim()}`),
  ];

  return lines.join("\n");
}

export function buildLeadWhatsAppUrl(lead: Lead): string {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    buildLeadMessage(lead),
  )}`;
}

/** Digits-only, capped at a Brazilian mobile with area code. */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

/** Brazilian currency input: "R$ 15.000" from raw keystrokes. */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (!digits) return "";
  return `R$ ${Number(digits).toLocaleString("pt-BR")}`;
}
