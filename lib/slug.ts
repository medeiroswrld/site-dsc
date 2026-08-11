/** URL-safe slug from free text: "Corolla XEi 2.0" → "corolla-xei-2-0". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/**
 * The slug shown in the vehicle URL. Built from the parts a buyer would search
 * for, so /estoque/chevrolet-tracker-premier-1-2-turbo-2023 reads as the car.
 */
export function vehicleSlug(parts: {
  brand: string;
  model: string;
  version: string;
  yearModel: number;
}): string {
  return slugify(
    `${parts.brand} ${parts.model} ${parts.version} ${parts.yearModel}`,
  );
}

/**
 * Appends -2, -3 … until the slug is free. Two Corollas of the same year and
 * version are common, and the URL has to stay unique.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
