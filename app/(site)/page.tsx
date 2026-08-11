import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/AboutSection";
import { FeaturedVehicles } from "@/components/sections/FeaturedVehicles";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { GoogleRating } from "@/components/sections/GoogleRating";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { Showroom360 } from "@/components/sections/Showroom360";
import { WorkshopSection } from "@/components/sections/WorkshopSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { itemListSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getFeaturedVehicles } from "@/lib/vehicles-repository";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Carros Seminovos em ${siteConfig.city}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featured = await getFeaturedVehicles(6);

  return (
    <>
      <HeroVideo />
      <FeaturedVehicles vehicles={featured} />
      <AboutSection />
      <WorkshopSection />
      <Showroom360 />
      <GoogleRating />
      <InstagramSection />
      <LocationSection />
      <FinalCTA />

      <JsonLd data={itemListSchema(featured)} />
    </>
  );
}
