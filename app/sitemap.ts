import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getStockVehicles } from "@/lib/vehicles-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getStockVehicles();
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

  // getStockVehicles já exclui os vendidos, que agora redirecionam.
  const vehicleRoutes: MetadataRoute.Sitemap = vehicles
    .map((vehicle) => ({
      url: `${siteConfig.url}/estoque/${vehicle.slug}`,
      lastModified: new Date(vehicle.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...vehicleRoutes];
}
