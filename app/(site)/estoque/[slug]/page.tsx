import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeaderOffset } from "@/components/layout/Header";
import { Reveal } from "@/components/motion/Reveal";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { VehicleContactCTA } from "@/components/vehicle/VehicleContactCTA";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { VehicleMobileBar } from "@/components/vehicle/VehicleMobileBar";
import { VehicleSpecPlate } from "@/components/vehicle/VehicleSpecPlate";
import { VehicleFeatures, VehicleSpecs } from "@/components/vehicle/VehicleSpecs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { formatYear, vehicleShortTitle, vehicleTitle } from "@/lib/format";
import { breadcrumbSchema, vehicleSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import {
  getAllVehicles,
  getRelatedVehicles,
  getVehicleBySlug,
} from "@/lib/vehicles-repository";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const vehicles = await getAllVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return { title: "Veículo não encontrado" };
  }

  const title = `${vehicleTitle(vehicle)} ${formatYear(vehicle)} à venda em ${siteConfig.city}`;
  const description = `${vehicleTitle(vehicle)} ${formatYear(vehicle)}, ${vehicle.mileage.toLocaleString("pt-BR")} km, ${vehicle.transmission.toLowerCase()}, ${vehicle.fuel.toLowerCase()}. Disponível na ${siteConfig.name}, em ${siteConfig.city} - ${siteConfig.state}.`;

  return {
    title,
    description,
    alternates: { canonical: `/estoque/${vehicle.slug}` },
    // A sold vehicle stays reachable for anyone holding the link, but it is
    // not worth a search result.
    robots:
      vehicle.status === "sold"
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/estoque/${vehicle.slug}`,
    },
  };
}

export default async function VehiclePage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const related = await getRelatedVehicles(vehicle, 3);

  const crumbs = [
    { name: "Início", path: "/" },
    { name: "Estoque", path: "/estoque" },
    { name: vehicle.brand, path: `/estoque?marca=${vehicle.brand}` },
    { name: vehicleShortTitle(vehicle), path: `/estoque/${vehicle.slug}` },
  ];

  return (
    <>
      <HeaderOffset />

      <Container size="wide" className="pt-6 lg:pt-10">
        <Breadcrumbs crumbs={crumbs} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-line pb-7 lg:mt-8">
          <div>
            <p className="eyebrow">{vehicle.brand}</p>
            <h1 className="display-3 mt-3">{vehicleShortTitle(vehicle)}</h1>
          </div>

          <VehicleSpecPlate
            vehicle={vehicle}
            size="md"
            className="w-full border-x-0 sm:w-auto sm:min-w-[22rem]"
          />
        </div>
      </Container>

      <Container size="wide" className="mt-7 lg:mt-9">
        <VehicleGallery vehicle={vehicle} />
      </Container>

      <Container size="wide" className="pb-24 pt-14 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-12 lg:col-span-7 xl:col-span-8">
            {vehicle.description.trim() && (
              <Reveal as="section">
                <h2 className="eyebrow">Sobre este veículo</h2>
                <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-muted">
                  {vehicle.description}
                </p>
              </Reveal>
            )}

            <Reveal>
              <VehicleSpecs vehicle={vehicle} />
            </Reveal>

            <Reveal>
              <VehicleFeatures vehicle={vehicle} />
            </Reveal>

            <Reveal as="section" className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-display text-[1.0625rem] font-semibold text-fg">
                Quer ver o carro pessoalmente?
              </h2>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
                O veículo está na loja em {siteConfig.city}, e o escritório
                fica no mesmo endereço — dá para ver o carro, negociar e
                resolver a documentação na mesma visita.
              </p>
              <UnderlineLink href="/contato" className="mt-3">
                Ver endereço e horários
              </UnderlineLink>
            </Reveal>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28">
              <VehicleContactCTA vehicle={vehicle} />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section
          className="border-t border-line bg-surface py-16 lg:py-20"
          aria-labelledby="parecidos-titulo"
        >
          <Container size="wide">
            <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <h2 id="parecidos-titulo" className="display-3">
                Veículos parecidos
              </h2>
              <UnderlineLink href="/estoque">Ver estoque completo</UnderlineLink>
            </Reveal>

            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <VehicleCard vehicle={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Extra room so the fixed bar never sits on top of the footer links. */}
      <div aria-hidden="true" className="h-20 lg:hidden" />

      <VehicleMobileBar vehicle={vehicle} />

      <JsonLd data={vehicleSchema(vehicle)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  );
}
