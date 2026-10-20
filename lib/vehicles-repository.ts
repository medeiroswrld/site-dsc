import { unstable_cache } from "next/cache";
import { cache } from "react";
import { vehicles as demoVehicles } from "@/data/vehicles";
import { isSupabaseConfigured, photoUrl } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { logger } from "@/lib/logger";
import {
  buscarEstoqueDoCrm,
  feedConfigurado,
  motivoDaUltimaFalha,
  normalizaMarca,
  veiculoDoFeed,
  type FeedVeiculo,
} from "@/lib/crm-feed";
import { uniqueSlug, vehicleSlug } from "@/lib/slug";
import type { StockFacets } from "@/lib/vehicle-filters";
import type { VehicleRowWithImages } from "@/lib/supabase/types";
import type {
  Vehicle,
  VehicleFilterState,
  VehicleSort,
} from "@/types/vehicle";

/**
 * The only module that knows where stock comes from.
 *
 * With Supabase connected it reads from Postgres. Without it — a fresh clone,
 * or before the store's project exists — it falls back to the demo array so
 * the whole site still renders. Nothing above this file knows the difference.
 */

const SELECT = `
  id, slug, brand, model, version, year_manufacture, year_model, mileage,
  price, transmission, fuel, color, doors, body_type, description, features,
  video_url, panorama_url, featured, status, created_at, updated_at,
  vehicle_images ( id, vehicle_id, path, alt, position, width, height )
`;


function rowToVehicle(row: VehicleRowWithImages): Vehicle {
  const images = [...(row.vehicle_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      src: photoUrl(image.path),
      alt:
        image.alt ||
        `${row.brand} ${row.model} ${row.version} — foto ${image.position + 1}`,
      width: image.width ?? 1600,
      height: image.height ?? 1000,
    }));

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    version: row.version,
    yearManufacture: row.year_manufacture,
    yearModel: row.year_model,
    mileage: row.mileage,
    price: row.price,
    transmission: row.transmission,
    fuel: row.fuel,
    color: row.color,
    doors: row.doors,
    bodyType: row.body_type,
    description: row.description,
    features: row.features ?? [],
    images,
    videoUrl: row.video_url ?? undefined,
    panoramaUrl: row.panorama_url ?? undefined,
    featured: row.featured,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * A vehicle with no photograph yet still needs a frame in every grid, so it
 * gets the neutral stand-in rather than a broken image.
 */
function withFallbackImage(vehicle: Vehicle): Vehicle {
  if (vehicle.images.length > 0) return vehicle;

  return {
    ...vehicle,
    images: [
      {
        src: "/placeholders/vehicle-01.svg",
        alt: `${vehicle.brand} ${vehicle.model} — foto ainda não cadastrada`,
        width: 1600,
        height: 1000,
        isPlaceholder: true,
      },
    ],
  };
}

/**
 * Cache key for the whole catalogue. Every write in the panel calls
 * `revalidateTag(VEHICLES_TAG)`, so the cache can be held indefinitely and
 * still never serve a stale price — freshness comes from invalidation, not
 * from expiry.
 */
export const VEHICLES_TAG = "vehicles";

/**
 * Reads the catalogue across requests.
 *
 * Without this, every page view — every click — paid a round trip to Postgres
 * before React could render a single card. A dealership's stock changes a few
 * times a week, so re-reading it on every visit buys nothing.
 */
const carregarLocais = unstable_cache(
  async (): Promise<Vehicle[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("estoque.read_failed", { err: error });
      return [];
    }

    return (data as unknown as VehicleRowWithImages[]).map((row) =>
      withFallbackImage(rowToVehicle(row)),
    );
  },
  ["vehicles-all"],
  { tags: [VEHICLES_TAG] },
);

/* -------------------------------------------------------------------------- */
/*  Casamento entre o feed do CRM e o que ja esta aqui                        */
/* -------------------------------------------------------------------------- */

/**
 * Nao existe id comum entre o CRM e este site: os 26 veiculos daqui entraram
 * por script, em agosto, e os do CRM foram cadastrados a parte. O casamento e
 * por aproximacao, e serve a UM proposito: carro que ja esta no ar precisa
 * MANTER o slug dele.
 *
 * Gerar slug novo trocaria o endereco de cada pagina de veiculo e jogaria fora
 * o que o Google ja indexou. Por isso o feed herda o slug do registro local
 * quando reconhece o mesmo carro.
 *
 * O ponto difícil: o CRM enfia o veiculo todo em `model` ("S10 LS 2.8 TDI CD
 * 4X4") e aqui ele esta separado em `model` + `version` ("S10" / "LS 2.8 TDI
 * CD 4x4"). Casar por `model` igual perdia metade dos carros, medido.
 */

/** Palavras que nao distinguem carro nenhum e so inflariam a nota. */
const RUIDO = new Set([
  "flex", "at", "mt", "aut", "automatico", "manual", "cd", "ce", "p", "2p", "4p",
]);

function palavras(...partes: Array<string | undefined>): Set<string> {
  const texto = partes
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  return new Set(
    (texto.match(/[a-z0-9]+/g) ?? []).filter((p) => !RUIDO.has(p)),
  );
}

/** Quanto das palavras do registro local aparecem no nome vindo do CRM. */
function nota(doCrm: FeedVeiculo, local: Vehicle): number {
  const a = palavras(doCrm.modelo, doCrm.versao);
  const b = palavras(local.model, local.version);
  if (b.size === 0) return 0;

  let comuns = 0;
  for (const p of b) if (a.has(p)) comuns += 1;
  return comuns / b.size;
}

const CORTE = 0.5;

/**
 * O catalogo final: estoque a venda vindo do CRM, mais o historico de
 * vendidos que ja estava aqui.
 *
 * Vendido fica porque a pagina dele tem valor de busca e o feed nunca o
 * devolve — se dependesse so do feed, 17 paginas indexadas sairiam do ar de
 * uma vez.
 *
 * Carro `available` daqui que o CRM NAO tem sai do site. Foi uma decisao: o
 * CRM e a fonte de verdade do que esta a venda, e anunciar o que a loja nao
 * tem gera a pior ligacao que uma revenda recebe.
 */
function mesclar(doCrm: FeedVeiculo[], locais: Vehicle[]): Vehicle[] {
  const pares: Array<{ n: number; i: number; j: number }> = [];

  doCrm.forEach((c, i) => {
    locais.forEach((l, j) => {
      if (normalizaMarca(c.marca) !== normalizaMarca(l.brand)) return;
      if ((Number(c.ano) || 0) !== l.yearManufacture) return;
      const n = nota(c, l);
      if (n >= CORTE) pares.push({ n, i, j });
    });
  });

  // Melhor nota primeiro, e cada carro casa uma vez so.
  pares.sort((x, y) => y.n - x.n);
  const slugDoCrm = new Map<number, string>();
  const usados = new Set<number>();
  for (const { i, j } of pares) {
    if (slugDoCrm.has(i) || usados.has(j)) continue;
    slugDoCrm.set(i, locais[j].slug);
    usados.add(j);
  }

  const tomados = new Set(locais.map((l) => l.slug));
  const doFeed = doCrm.map((c, i) => {
    const herdado = slugDoCrm.get(i);
    const slug =
      herdado ??
      uniqueSlug(
        vehicleSlug({
          brand: normalizaMarca(c.marca),
          model: c.modelo ?? "",
          version: c.versao ?? "",
          yearModel: Number(c.ano) || 0,
        }),
        tomados,
      );
    tomados.add(slug);
    return withFallbackImage(veiculoDoFeed(c, slug));
  });

  const vendidos = locais.filter(
    (l, j) => !usados.has(j) && l.status === "sold",
  );

  const descartados = locais.filter(
    (l, j) => !usados.has(j) && l.status !== "sold",
  );
  if (descartados.length > 0) {
    // Visivel de proposito: e um carro que o site anunciava e o CRM nao tem.
    logger.warn("estoque.local_sem_par_no_crm", {
      slugs: descartados.map((l) => l.slug),
    });
  }

  return [...doFeed, ...vendidos];
}

/**
 * `cache` dedupes within one render; `unstable_cache` holds across requests.
 *
 * A ordem das fontes e uma cascata, e nenhuma delas devolve lista vazia:
 *
 *     feed do CRM  ->  banco deste site  ->  estoque de demonstracao
 *
 * O feed fica FORA do `unstable_cache` de proposito. Aquele cache nao tem
 * prazo — e invalidado por `revalidateTag`, que so o painel deste site chama.
 * Com o feed dentro dele, carro cadastrado no CRM nunca apareceria: o site
 * ficaria com cara de funcionando e congelado. O `fetch` do feed tem o seu
 * proprio prazo de 300s.
 */
export const getAllVehicles = cache(async function getAllVehicles(): Promise<
  Vehicle[]
> {
  if (!isSupabaseConfigured) return demoVehicles;

  const locais = await carregarLocais();
  if (!feedConfigurado) return locais;

  const doCrm = await buscarEstoqueDoCrm();
  // `null` e falha (rede, token revogado, loja suspensa com 402). Diferente de
  // lista vazia: aqui o site mantem o que tem em vez de apagar a vitrine.
  if (!doCrm) {
    logger.warn("estoque.feed_indisponivel", {
      motivo: motivoDaUltimaFalha(),
      locais: locais.length,
    });
    return locais;
  }

  return mesclar(doCrm, locais);
});

/**
 * O catálogo público: o que a loja tem para vender, hoje.
 *
 * Um carro vendido deixa de existir para o visitante — não aparece na lista,
 * não entra nas opções de filtro e não conta no total. A loja pediu assim, e
 * faz sentido: vitrine com carro vendido faz o estoque parecer maior do que é
 * e gasta o tempo de quem clica.
 *
 * `getAllVehicles` continua devolvendo tudo, porque o painel e o sitemap
 * precisam enxergar os vendidos para tratá-los.
 */
export async function getStockVehicles(): Promise<Vehicle[]> {
  const all = await getAllVehicles();
  return all.filter((vehicle) => vehicle.status !== "sold");
}

/**
 * Derived from the cached list rather than its own query. A used-car lot holds
 * tens of vehicles, not thousands, so filtering in memory is faster than a
 * second round trip and keeps one cache entry instead of one per slug.
 */
export async function getVehicleBySlug(
  slug: string,
): Promise<Vehicle | undefined> {
  const all = await getAllVehicles();
  return all.find((vehicle) => vehicle.slug === slug);
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const sellable = await getStockVehicles();

  return [
    ...sellable.filter((vehicle) => vehicle.featured),
    ...sellable.filter((vehicle) => !vehicle.featured),
  ].slice(0, limit);
}

export async function getRelatedVehicles(
  vehicle: Vehicle,
  limit = 3,
): Promise<Vehicle[]> {
  const all = await getAllVehicles();
  const others = all.filter(
    (candidate) =>
      candidate.id !== vehicle.id && candidate.status === "available",
  );

  // Closest match first: same body type, then nearest price.
  return others
    .map((candidate) => ({
      candidate,
      score:
        (candidate.bodyType === vehicle.bodyType ? 0 : 1_000_000) +
        Math.abs((candidate.price ?? 0) - (vehicle.price ?? 0)) / 1000,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}


/* -------------------------------------------------------------------------- */
/*  Facets — the option lists the filter UI renders from                       */
/* -------------------------------------------------------------------------- */


const EMPTY_FACETS: StockFacets = {
  brands: [],
  modelsByBrand: {},
  bodyTypes: [],
  transmissions: [],
  fuels: [],
  yearMin: new Date().getFullYear() - 10,
  yearMax: new Date().getFullYear(),
  priceMin: 0,
  priceMax: 0,
  mileageMax: 0,
};

/** Built from the stock itself, so the filters never offer an empty result. */
export async function getStockFacets(): Promise<StockFacets> {
  const list = await getStockVehicles();
  if (!list.length) return EMPTY_FACETS;

  const priced = list
    .map((vehicle) => vehicle.price)
    .filter((price): price is number => price !== null);

  const modelsByBrand: Record<string, string[]> = {};
  for (const vehicle of list) {
    const models = (modelsByBrand[vehicle.brand] ??= []);
    if (!models.includes(vehicle.model)) models.push(vehicle.model);
  }
  for (const models of Object.values(modelsByBrand)) {
    models.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  const unique = <T,>(values: T[]) => Array.from(new Set(values));
  const sortPt = (values: string[]) =>
    values.sort((a, b) => a.localeCompare(b, "pt-BR"));

  return {
    brands: sortPt(unique(list.map((vehicle) => vehicle.brand))),
    modelsByBrand,
    bodyTypes: sortPt(unique(list.map((vehicle) => vehicle.bodyType))),
    transmissions: sortPt(unique(list.map((vehicle) => vehicle.transmission))),
    fuels: sortPt(unique(list.map((vehicle) => vehicle.fuel))),
    yearMin: Math.min(...list.map((vehicle) => vehicle.yearModel)),
    yearMax: Math.max(...list.map((vehicle) => vehicle.yearModel)),
    priceMin: priced.length ? Math.min(...priced) : 0,
    priceMax: priced.length ? Math.max(...priced) : 0,
    mileageMax: Math.max(...list.map((vehicle) => vehicle.mileage)),
  };
}

/* -------------------------------------------------------------------------- */
/*  Pure logic lives in lib/vehicle-filters.ts so the browser can use it       */
/*  without dragging this module in. Re-exported for the server-side callers   */
/*  that already import it from here.                                          */
/* -------------------------------------------------------------------------- */
export type { StockFacets } from "@/lib/vehicle-filters";
export {
  isRecentArrival,
  defaultFilters,
  filterVehicles,
  sortVehicles,
  countActiveFilters,
} from "@/lib/vehicle-filters";
