import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllVehicles } from "@/lib/vehicles-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/estoque`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/venda-seu-carro`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/financiamento`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/contato`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${siteConfig.url}/politica-de-privacidade`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Sold vehicles are excluded to match their `noindex` metadata.
  const vehicleRoutes: MetadataRoute.Sitemap = vehicles
    .filter((vehicle) => vehicle.status !== "sold")
    .map((vehicle) => ({
      url: `${siteConfig.url}/estoque/${vehicle.slug}`,
      lastModified: new Date(vehicle.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...vehicleRoutes];
}
