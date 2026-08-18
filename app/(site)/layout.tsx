import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/ui/JsonLd";
import { autoDealerSchema, websiteSchema } from "@/lib/seo";
import { StoreProvider } from "@/components/layout/StoreProvider";
import { getStoreInfo } from "@/lib/site-content-repository";
import { siteConfig } from "@/lib/site";
import "../globals.css";

/* Display: an industrial grotesque with the compactness of shop signage.
   Body: a humanist sans that stays comfortable at long paragraph lengths.
   Mono: the data-plate voice used for every spec, price and label. */

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    // A palavra-chave vem antes da marca de propósito: a loja tem três anos
    // e ninguém procura por "D.S.C." — procuram por seminovos na cidade, e é
    // esse o trecho que precisa sobreviver ao corte do Google.
    default: `Seminovos em ${siteConfig.city} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `Seminovos em ${siteConfig.city} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `Seminovos em ${siteConfig.city} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true },
  category: "automotive",
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolved once here and shared: every header, footer and floating button on
  // the page reads the same numbers, and the database is touched once.
  const store = await getStoreInfo();

  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${instrumentSans.variable} ${plexMono.variable}`}
    >
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2.5 focus:text-[0.875rem] focus:text-brand-ink"
        >
          Ir para o conteúdo
        </a>

        <StoreProvider store={store}>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
          <WhatsAppButton />
        </StoreProvider>

        <JsonLd data={autoDealerSchema(store)} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
