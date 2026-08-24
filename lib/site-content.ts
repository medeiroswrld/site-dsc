/**
 * The parts of the site the store edits from the panel.
 *
 * Two kinds of thing live here: the named image slots of the layout, and the
 * store data that changes over time (phone, address, hours, rating). Both are
 * declared once, so the panel and the pages can never drift apart about what
 * exists or what a field means.
 *
 * Nothing here reads the database. `lib/site-content-repository.ts` does that,
 * and falls back to these defaults whenever a row is missing — the site has to
 * render on a fresh install, before anyone has uploaded anything.
 */

import { media, siteConfig } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/*  Image and video slots                                                      */
/* -------------------------------------------------------------------------- */

export type MediaKind = "image" | "video";

export interface MediaSlot {
  /** Stable key. Also the primary key in `site_media` — never rename one. */
  id: string;
  label: string;
  /** Where it shows up, in the words the store would use. */
  where: string;
  /** What makes a good photo here. Shown under the upload button. */
  hint: string;
  kind: MediaKind;
  /** Shape of the frame, so the panel previews it the way the site will. */
  aspect: string;
  /** Used until the store uploads its own. */
  fallback: string;
  /** Written into the `alt` of the fallback, and the default for uploads. */
  alt: string;
}

export const MEDIA_SLOTS: MediaSlot[] = [
  {
    id: "hero_poster",
    label: "Imagem do topo",
    where: "Primeira tela da home, atrás do título",
    hint: "Horizontal e escura nas bordas — o texto branco fica por cima. Evite fotos claras demais.",
    kind: "image",
    aspect: "16 / 9",
    fallback: media.heroPoster,
    alt: `Fachada da ${siteConfig.name}`,
  },
  {
    id: "hero_video",
    label: "Vídeo do topo",
    where: "Primeira tela da home, no lugar da imagem",
    hint: "Opcional. Sem áudio, de 10 a 20 segundos, em MP4. Acima de 10 MB o celular demora a carregar.",
    kind: "video",
    aspect: "16 / 9",
    fallback: "",
    alt: "",
  },
  {
    id: "facade",
    label: "Fachada da loja",
    where: 'Home, seção "A D.S.C." — e também na página Sobre',
    hint: "A frente da loja vista da rua, de dia.",
    kind: "image",
    aspect: "4 / 5",
    fallback: "/placeholders/facade.svg",
    alt: `Fachada da ${siteConfig.name}`,
  },
  {
    // O id continua "workshop" de propósito: é a chave da linha no banco e do
    // arquivo já enviado. Renomear aqui órfã a foto que a loja subiu.
    id: "workshop",
    label: "Escritório",
    where: 'Home, seção "Escritório próprio" — e na página Sobre',
    hint: "O escritório onde a loja atende: mesa, atendimento, ambiente.",
    kind: "image",
    aspect: "4 / 3",
    fallback: "/placeholders/workshop.svg",
    alt: `Escritório da ${siteConfig.shortName}`,
  },
  {
    id: "store_front",
    label: "Loja — página Venda seu carro",
    where: 'Página "Venda seu carro", ao lado do formulário',
    hint: "Pode ser a mesma da fachada, ou o pátio com os carros.",
    kind: "image",
    aspect: "4 / 3",
    fallback: "/placeholders/store-front.svg",
    alt: `Pátio da ${siteConfig.name}`,
  },
];

export const MEDIA_SLOT_IDS = MEDIA_SLOTS.map((slot) => slot.id);

export function findSlot(id: string): MediaSlot | undefined {
  return MEDIA_SLOTS.find((slot) => slot.id === id);
}

/** What a page receives for a slot, whether it came from the panel or not. */
export interface ResolvedMedia {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** A stand-in drawing, not a photograph — it skips the image optimiser. */
  isPlaceholder: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Store data                                                                 */
/* -------------------------------------------------------------------------- */

export interface StoreHours {
  days: string;
  time: string;
}

/**
 * Only the fields that change with the business. Name, domain and the page
 * copy stay in lib/site.ts: those are the site's identity, not its data, and
 * an editable field is one more thing that can be broken by accident.
 */
export interface StoreInfo {
  phoneDisplay: string;
  phoneE164: string;
  whatsapp: string;
  street: string;
  neighbourhood: string;
  city: string;
  state: string;
  postalCode: string;
  instagramHandle: string;
  instagramUrl: string;
  googleReviewsUrl: string;
  ratingValue: number;
  ratingCount: number;
  foundedYearsText: string;
  hours: StoreHours[];
}

/** The values shipped in the code — used until the panel overrides them. */
export const STORE_DEFAULTS: StoreInfo = {
  phoneDisplay: siteConfig.phone.display,
  phoneE164: siteConfig.phone.e164,
  whatsapp: siteConfig.whatsapp,
  street: siteConfig.address.street,
  neighbourhood: siteConfig.address.neighbourhood,
  city: siteConfig.address.city,
  state: siteConfig.address.state,
  postalCode: siteConfig.address.postalCode,
  instagramHandle: siteConfig.instagram.handle,
  instagramUrl: siteConfig.instagram.url,
  googleReviewsUrl: siteConfig.googleReviewsUrl,
  ratingValue: siteConfig.rating.value,
  ratingCount: siteConfig.rating.count,
  foundedYearsText: siteConfig.foundedYearsText,
  hours: siteConfig.hours.map((entry) => ({ ...entry })),
};

/** Full postal address, rebuilt from whatever the panel currently holds. */
export function formatAddress(store: StoreInfo): string {
  return `${store.street}, ${store.neighbourhood}, ${store.city} - ${store.state}, ${store.postalCode}`;
}

export function mapsDirections(store: StoreInfo): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    formatAddress(store),
  )}`;
}

export function mapsEmbed(store: StoreInfo): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    formatAddress(store),
  )}&output=embed`;
}
