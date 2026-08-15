/**
 * Single source of truth for everything the business owns: name, address,
 * phone, social. NAP consistency matters for local SEO — nothing below should
 * be retyped anywhere else in the codebase.
 */

export const siteConfig = {
  name: "D.S.C. Seminovos",
  shortName: "D.S.C.",
  legalName: "D.S.C. Seminovos",
  /** Update to the production domain before launch. */
  url: "https://www.dscseminovos.com.br",
  description:
    "Loja de carros seminovos em Itapetininga, São Paulo. Veículos selecionados, oficina própria e atendimento direto da equipe. Veja o estoque disponível.",
  city: "Itapetininga",
  state: "SP",
  stateName: "São Paulo",
  foundedYearsText: "mais de 7 anos",

  address: {
    street: "R. Av. 5 de Novembro, 825",
    neighbourhood: "Vila Nastri",
    city: "Itapetininga",
    state: "SP",
    postalCode: "18207-320",
    country: "BR",
  },

  /** Approximate store coordinates — refine with the exact pin from Maps. */
  geo: {
    latitude: -23.5915,
    longitude: -48.0533,
  },

  phone: {
    display: "(15) 3271-0164",
    /** E.164, for tel: links. */
    e164: "+551532710164",
  },

  /**
   * WhatsApp da loja, só dígitos com o código do país.
   *
   * São dois de propósito. O geral atende estoque, financiamento e contato —
   * é onde o comprador chega. O de avaliação recebe quem quer vender ou dar
   * o carro na troca, que é uma conversa diferente e costuma ficar com outra
   * pessoa da equipe.
   */
  whatsapp: "5515992268988",
  whatsappSellCar: "551532710164",

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
