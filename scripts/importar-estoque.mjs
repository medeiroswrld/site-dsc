/**
 * Importa o estoque para o Supabase.
 *
 *   node scripts/importar-estoque.mjs           (mostra o que faria)
 *   node scripts/importar-estoque.mjs --gravar  (grava de verdade)
 *
 * É idempotente: um veículo cujo slug já existe é pulado, então rodar duas
 * vezes não duplica nada.
 *
 * DEPOIS DE RODAR: reinicie o servidor. O site guarda o catálogo em cache e só
 * o descarta quando o painel grava algo — uma escrita direta no banco, como
 * esta, passa por baixo dessa invalidação.
 *
 * O que NÃO veio na lista de origem e ficou em branco de propósito:
 *   - cor, descrição e itens do veículo  → preencher pelo painel
 *   - fotos                              → subir pelo painel, por veículo
 * Nada disso foi inventado.
 *
 * Portas: só foi preenchido onde o próprio modelo define (Fusca 2, Veloster 3,
 * Saveiro cabine simples 2, S10 CD 4). O resto ficou em 4, que é o padrão
 * desses hatches e sedãs — confira antes de publicar.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { uniqueSlug, vehicleSlug } from "../lib/slug.ts";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

/* --------------------------------------------------------------------------
   O estoque, transcrito da lista da loja.

   Marcas normalizadas ("Volkswagem" → Volkswagen, "CITROEN" → Citroën) e
   modelo separado da versão, para que a ficha e a URL fiquem legíveis.
   -------------------------------------------------------------------------- */
const VEICULOS = [
  { brand: "Chevrolet",  model: "Corsa",     version: "1.0 LS VHC-E",     year: 2013, price: 32900,  km: 231963, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Chevrolet",  model: "Vectra",    version: "2.0 GT-X",         year: 2010, price: 47900,  km: 134735, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Volkswagen", model: "Fox",       version: "1.6 Connect",      year: 2020, price: 63900,  km: 70162,  transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Chevrolet",  model: "Celta",     version: "1.0",              year: 2012, price: 24900,  km: 250000, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Honda",      model: "Fit",       version: "1.5 LX",           year: 2008, price: 37900,  km: 226379, transmission: "Automático", fuel: "Gasolina", bodyType: "Hatch",  doors: 4 },
  { brand: "Chevrolet",  model: "Onix",      version: "1.0 Turbo",        year: 2020, price: 68900,  km: 108151, transmission: "Automático", fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Ford",       model: "Fiesta",    version: "1.6",              year: 2013, price: 37900,  km: 141000, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Audi",       model: "A3",        version: "1.8",              year: 2004, price: 28900,  km: 256000, transmission: "Manual",     fuel: "Gasolina", bodyType: "Hatch",  doors: 4 },
  { brand: "Volkswagen", model: "T-Cross",   version: "200 TSI 1.0",      year: 2025, price: 118900, km: 40000,  transmission: "Automático", fuel: "Flex",     bodyType: "SUV",    doors: 4 },
  { brand: "Chevrolet",  model: "Onix Plus", version: "Premier 1.0",      year: 2025, price: 99900,  km: 40701,  transmission: "Automático", fuel: "Flex",     bodyType: "Sedã",   doors: 4 },
  { brand: "Volkswagen", model: "Fox",       version: "1.0",              year: 2014, price: 42900,  km: 185575, transmission: "Automático", fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Citroën",    model: "C4",        version: "GLX 1.6",          year: 2010, price: 29900,  km: 218058, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Fiat",       model: "Argo",      version: "Drive 1.3",        year: 2018, price: 58900,  km: 155587, transmission: "Automático", fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Citroën",    model: "C3",        version: "Tendance 1.5",     year: 2013, price: 37900,  km: 181150, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Jeep",       model: "Renegade",  version: "1.8 4x2",          year: 2016, price: 64900,  km: 166215, transmission: "Manual",     fuel: "Flex",     bodyType: "SUV",    doors: 4 },
  { brand: "Hyundai",    model: "Veloster",  version: "1.6",              year: 2012, price: 61900,  km: 147352, transmission: "Automático", fuel: "Flex",     bodyType: "Cupê",   doors: 3 },
  { brand: "Volkswagen", model: "Gol",       version: "1.0",              year: 2008, price: 22900,  km: 231143, transmission: "Manual",     fuel: "Flex",     bodyType: "Hatch",  doors: 4 },
  { brand: "Chevrolet",  model: "S10",       version: "LS 2.8 TDI CD 4x4",year: 2024, price: 174900, km: 54744,  transmission: "Manual",     fuel: "Diesel",   bodyType: "Picape", doors: 4 },
  { brand: "Volkswagen", model: "Saveiro",   version: "1.6",              year: 2011, price: 41900,  km: 233582, transmission: "Manual",     fuel: "Flex",     bodyType: "Picape", doors: 2 },
  { brand: "Volkswagen", model: "Fusca",     version: "1300",             year: 1978, price: 15900,  km: 14643,  transmission: "Manual",     fuel: "Gasolina", bodyType: "Sedã",   doors: 2 },
  { brand: "Volkswagen", model: "Parati",    version: "1.8",              year: 2001, price: 28900,  km: 163753, transmission: "Manual",     fuel: "Gasolina", bodyType: "Perua",  doors: 4 },
];

/* -------------------------------------------------------------------------- */

const gravar = process.argv.includes("--gravar");

const { data: existentes, error: erroLeitura } = await supabase
  .from("vehicles")
  .select("slug");

if (erroLeitura) {
  console.error("Não consegui ler o estoque atual:", erroLeitura.message);
  process.exit(1);
}

const ocupados = new Set((existentes ?? []).map((row) => row.slug));
console.log(`Já no banco: ${ocupados.size} veículo(s).`);
console.log(gravar ? "Modo: GRAVANDO\n" : "Modo: simulação (use --gravar para valer)\n");

const linhas = [];
let pulados = 0;

for (const v of VEICULOS) {
  const base = vehicleSlug({
    brand: v.brand,
    model: v.model,
    version: v.version,
    yearModel: v.year,
  });

  if (ocupados.has(base)) {
    console.log(`  pulado (já existe): ${base}`);
    pulados += 1;
    continue;
  }

  const slug = uniqueSlug(base, ocupados);
  ocupados.add(slug);

  linhas.push({
    slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year_manufacture: v.year,
    year_model: v.year,
    mileage: v.km,
    price: v.price,
    transmission: v.transmission,
    fuel: v.fuel,
    color: "",
    doors: v.doors,
    body_type: v.bodyType,
    description: "",
    features: [],
    video_url: null,
    featured: false,
    status: "available",
  });

  console.log(
    `  ${gravar ? "gravando" : "gravaria"}: ${v.brand} ${v.model} ${v.version} ${v.year} — R$ ${v.price.toLocaleString("pt-BR")}`,
  );
}

console.log(`\nTotal a inserir: ${linhas.length} | pulados: ${pulados}`);

if (!gravar || !linhas.length) {
  if (!gravar) console.log("\nNada foi gravado. Rode com --gravar para aplicar.");
  process.exit(0);
}

const { error } = await supabase.from("vehicles").insert(linhas);
if (error) {
  console.error("\nFalhou:", error.message);
  process.exit(1);
}

const { data: total } = await supabase.from("vehicles").select("id");
console.log(`\nPronto. O banco agora tem ${total.length} veículos.`);
