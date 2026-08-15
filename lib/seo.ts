import { formatYear, vehicleTitle } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { STORE_DEFAULTS, type StoreInfo } from "@/lib/site-content";
import type { Vehicle } from "@/types/vehicle";

/**
 * Structured data builders. Every value here is derived from `siteConfig` or
 * from real vehicle records — nothing is fabricated for SEO purposes.
 */

function postalAddress(store: StoreInfo) {
  return {
    "@type": "PostalAddress",
    streetAddress: store.street,
    addressLocality: store.city,
    addressRegion: store.state,
    postalCode: store.postalCode,
    addressCountry: siteConfig.address.country,
  };
}

export const dealerId = `${siteConfig.url}/#autodealer`;

/**
 * The block Google reads to show the shop in search and on the map.
 *
 * It takes the store data rather than importing it, so the phone number and
 * rating in the markup can never disagree with the ones on the page.
 */
export function autoDealerSchema(store: StoreInfo = STORE_DEFAULTS) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": dealerId,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: store.phoneE164,
    address: postalAddress(store),
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: {
      "@type": "City",
      name: `${siteConfig.city}, ${siteConfig.stateName}`,
    },
    sameAs: [store.instagramUrl],
    priceRange: "$$",
    // Reported by the business; kept in one place so it is never invented.
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: store.ratingValue,
      reviewCount: store.ratingCount,
      bestRating: siteConfig.rating.scale,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:30",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "08:30",
        closes: "12:30",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "pt-BR",
    publisher: { "@id": dealerId },
  };
}

export function vehicleSchema(vehicle: Vehicle) {
  const url = `${siteConfig.url}/estoque/${vehicle.slug}`;

  const availability =
    vehicle.status === "available"
      ? "https://schema.org/InStock"
      : vehicle.status === "reserved"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/SoldOut";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${vehicleTitle(vehicle)} ${formatYear(vehicle)}`,
    description: vehicle.description,
    url,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleConfiguration: vehicle.version,
    modelDate: String(vehicle.yearModel),
    productionDate: String(vehicle.yearManufacture),
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuel,
    color: vehicle.color,
    numberOfDoors: vehicle.doors,
    bodyType: vehicle.bodyType,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    itemCondition: "https://schema.org/UsedCondition",
  };

  // Photography is only advertised to crawlers once it is real.
  const realImages = vehicle.images.filter((image) => !image.isPlaceholder);
  if (realImages.length) {
    schema.image = realImages.map((image) => `${siteConfig.url}${image.src}`);
  }

  // An offer is only emitted when there is an actual price to publish.
  if (vehicle.price !== null) {
    schema.offers = {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "BRL",
      availability,
      url,
      seller: { "@id": dealerId },
    };
  }

  return schema;
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteConfig.url}${crumb.path}`,
    })),
  };
}

export function itemListSchema(vehicles: Vehicle[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/estoque/${vehicle.slug}`,
      name: `${vehicleTitle(vehicle)} ${formatYear(vehicle)}`,
    })),
  };
}
