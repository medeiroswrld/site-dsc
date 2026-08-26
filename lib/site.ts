/**
 * Single source of truth for everything the business owns: name, address,
 * phone, social. NAP consistency matters for local SEO — nothing below should
 * be retyped anywhere else in the codebase.
 */

export const siteConfig = {
  name: "D.S.C. Seminovos",
  shortName: "D.S.C.",
  legalName: "D.S.C. Seminovos",
  /** Só dígitos aqui; a formatação fica em `formatCnpj`, para não haver duas verdades. */
  cnpj: "51747334000164",
  /** Update to the production domain before launch. */
  url: "https://www.dscseminovos.com.br",
  description:
    "Loja de carros seminovos em Itapetininga, São Paulo. Veículos selecionados, escritório próprio e atendimento direto da equipe. Veja o estoque disponível.",
  city: "Itapetininga",
  state: "SP",
  stateName: "São Paulo",
  foundedYearsText: "mais de 3 anos",

  address: {
    street: "R. Av. 5 de Novembro, 825",
    neighbourhood: "Vila Nastri",
    city: "Itapetininga",
    state: "SP",
    postalCode: "18207-320",
    country: "BR",
  },

  /** Pin exato da loja, tirado do Google Maps. */
  geo: {
    latitude: -23.594773736633208,
    longitude: -48.06013497730157,
  },

  phone: {
    display: "(15) 3271-0164",
    /** E.164, for tel: links. */
    e164: "+551532710164",
  },

  /** WhatsApp da loja, só dígitos com o código do país. */
  whatsapp: "551532710164",

  instagram: {
    handle: "@dsc_seminovos",
    url: "https://www.instagram.com/dsc_seminovos/",
  },

  /**
   * INTEGRATION POINT: replace with the store's Google Business Profile link
   * (the "Escrever avaliação"/place URL) once available.
   */
  googleReviewsUrl:
    "https://www.google.com/search?q=D.S.C.+Seminovos+Itapetininga",

  /** Reported by the business. Do not edit without a fresh reading. */
  rating: {
    value: 4.8,
    count: 39,
    scale: 5,
  },

  hours: [
    { days: "Segunda a sexta", time: "08h30 às 18h00" },
    { days: "Sábado", time: "08h30 às 12h30" },
  ],
} as const;

/** 51747334000164 -> 51.747.334/0001-64 */
export function formatCnpj(digits: string): string {
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.neighbourhood}, ${siteConfig.address.city} - ${siteConfig.address.state}, ${siteConfig.address.postalCode}`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  fullAddress,
)}`;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  fullAddress,
)}&output=embed`;

export interface NavItem {
  label: string;
  href: string;
  /** Shown in the reduced mobile navigation bar. */
  primaryOnMobile?: boolean;
}

export const navigation: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Estoque", href: "/estoque", primaryOnMobile: true },
  { label: "Venda seu carro", href: "/venda-seu-carro" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "A D.S.C.", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

/**
 * Media that the store still needs to supply. Referenced by the components
 * that consume it so a missing file degrades instead of breaking the layout.
 */
export const media = {
  /**
   * Flip to `true` once the store's film is sitting in /public/media/.
   * While it is false the <video> element is never mounted, so the browser
   * cannot paint a broken-media frame behind the hero.
   */
  hasHeroVideo: false,
  /** Store presentation film for the home hero. */
  heroVideo: "/media/hero.mp4",
  heroVideoWebm: "/media/hero.webm",
  heroPoster: "/placeholders/hero-poster.svg",
  /** Equirectangular panorama of the showroom. Null hides the 360 section. */
  showroomPanorama: null as string | null,
} as const;
