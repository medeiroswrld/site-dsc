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
import { getSiteMedia } from "@/lib/site-content-repository";
import { getFeaturedVehicles } from "@/lib/vehicles-repository";

export const metadata: Metadata = {
  title: `${siteConfig.name} | Carros Seminovos em ${siteConfig.city}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, media] = await Promise.all([
    getFeaturedVehicles(6),
    getSiteMedia(),
  ]);

  // A slot with nothing uploaded still carries its stand-in drawing; only the
  // film is genuinely optional, so it is the one that can be null.
  const heroFilm = media.hero_video.isPlaceholder ? null : media.hero_video;

  return (
    <>
      <HeroVideo poster={media.hero_poster} video={heroFilm} />
      <FeaturedVehicles vehicles={featured} />
      <AboutSection />
      <WorkshopSection office={media.workshop} />
      <Showroom360 />
      <GoogleRating />
      <InstagramSection />
      <LocationSection />
      <FinalCTA />

      <JsonLd data={itemListSchema(featured)} />
    </>
  );
}
