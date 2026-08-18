import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { StockBrowser } from "@/components/vehicle/StockBrowser";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { filtersFromParams } from "@/lib/stock-params";
import { getAllVehicles, getStockFacets } from "@/lib/vehicles-repository";

export const metadata: Metadata = {
  title: `Carros Seminovos em ${siteConfig.city} | Estoque`,
  description: `Veja os carros seminovos disponíveis na ${siteConfig.name}, em ${siteConfig.city} - ${siteConfig.state}. Filtre por marca, modelo, ano, preço e quilometragem.`,
  alternates: { canonical: "/estoque" },
  openGraph: {
    title: `Estoque de seminovos em ${siteConfig.city} | ${siteConfig.name}`,
    description: `Carros seminovos disponíveis na ${siteConfig.name}. Filtre por marca, modelo, ano, preço e quilometragem.`,
    url: `${siteConfig.url}/estoque`,
  },
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, vehicles, facets] = await Promise.all([
    searchParams,
    getAllVehicles(),
    getStockFacets(),
  ]);

  const initialFilters = filtersFromParams(params);

  return (
    <>
      {/* No count in the header: the toolbar below carries the live figure,
          and two numbers a few pixels apart only invite doubt. */}
      <PageHeader
        eyebrow="Estoque"
        title="Encontre seu próximo carro na D.S.C."
        description={`Todos os veículos abaixo estão na loja em ${siteConfig.city}. Use os filtros para chegar ao que procura e fale com a equipe sobre o carro que interessar.`}
      />

      <StockBrowser
        vehicles={vehicles}
        facets={facets}
        initialFilters={initialFilters}
      />

      <FinalCTA
        headline="Não achou o carro que procurava?"
        body="Conte para a equipe o que você quer. Nem todo veículo que entra na loja chega ao site no mesmo dia."
        showStockLink={false}
      />

      <JsonLd data={itemListSchema(vehicles)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Estoque", path: "/estoque" },
        ])}
      />
    </>
  );
}
