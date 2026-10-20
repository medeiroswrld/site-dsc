/**
 * O estoque vindo do CRM (Amply), via feed público.
 *
 * ── Por que isto existe ───────────────────────────────────────────────────
 *
 * O estoque era cadastrado duas vezes: no CRM, onde a loja trabalha, e aqui,
 * à mão. Medido em 20/10/2026, o resultado da divergência:
 *
 *     CRM   55 carros, 37 à venda
 *     site  26 veículos, 9 à venda
 *
 * R$ 1.471.200 de estoque com foto pronta que o site não mostrava, e uma
 * T-Cross marcada como vendida aqui enquanto o CRM a tinha disponível.
 *
 * ── Por que ler, e não sincronizar ────────────────────────────────────────
 *
 * O feed devolve só `available` e `reserved`. Carro vendido desaparece porque
 * a consulta não o traz, não porque alguém avisou — não há job, fila nem
 * webhook para desalinhar.
 *
 * E tem um motivo concreto: a faxina de mídia do CRM apaga as fotos 20 dias
 * depois da venda. Na medição de 20/10, dez carros vendidos já estavam com
 * zero fotos lá. Se este site copiasse as URLs do CRM, essas dez páginas
 * estariam com imagem quebrada hoje. Lendo o feed o problema não existe,
 * porque vendido nunca chega aqui.
 *
 * ── O que o feed NÃO tem ──────────────────────────────────────────────────
 *
 * Carroceria, portas, itens, destaque e panorama não existem no CRM. São
 * resolvidos aqui (carroceria) ou ficam com o padrão e seguem editáveis pelo
 * painel (o resto). Placa e chassi ficam fora do feed de propósito — anúncio
 * com placa exposta é material de clonagem.
 */

import type {
  BodyType,
  Fuel,
  Transmission,
  Vehicle,
  VehicleImage,
} from "@/types/vehicle";

/**
 * Quantas fotos por veículo o site publica.
 *
 * A loja pediu 4. Todos os 37 veículos à venda têm 4 ou mais (o máximo é 8),
 * então o corte entrega exatamente 4 em todos — nenhum fica sem galeria.
 *
 * É uma constante, e não um número espalhado pelo código, porque é a primeira
 * coisa que vai mudar quando quiserem a galeria cheia de volta.
 */
export const FOTOS_POR_VEICULO = 4;

/** O que o feed devolve. Reflete `supabase/functions/estoque-publico`. */
export interface FeedVeiculo {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: number | null;
  km: number;
  preco: number | null;
  cor: string;
  cambio: string;
  combustivel: string;
  tipo: string;
  descricao: string;
  video: string | null;
  fotos: string[];
  entrou_em: string;
}

interface FeedResposta {
  loja?: string;
  veiculos?: FeedVeiculo[];
}

/* -------------------------------------------------------------------------- */
/*  Normalização                                                              */
/* -------------------------------------------------------------------------- */

function semAcento(v: string): string {
  return v.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function chaveDe(v: string): string {
  return semAcento(v).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * A marca é digitada à mão no CRM, e a mesma marca aparece de várias formas.
 * Valores reais encontrados em 20/10: "GM" (3 carros), "Volkswagem",
 * "Citröen", "CAOACHERY", mais a mistura de CAIXA ALTA e Capitalizada.
 *
 * Sem isto, o filtro de marca do /estoque listaria "GM" e "CHEVROLET" como
 * duas marcas diferentes, e o comprador que clicasse em uma perderia a outra.
 */
const MARCA: Record<string, string> = {
  gm: "Chevrolet",
  chevrolet: "Chevrolet",
  vw: "Volkswagen",
  volkswagen: "Volkswagen",
  volkswagem: "Volkswagen",
  citroen: "Citroën",
  caoachery: "CAOA Chery",
  chery: "CAOA Chery",
  fiat: "Fiat",
  ford: "Ford",
  honda: "Honda",
  hyundai: "Hyundai",
  jeep: "Jeep",
  renault: "Renault",
  subaru: "Subaru",
  yamaha: "Yamaha",
  toyota: "Toyota",
  nissan: "Nissan",
  peugeot: "Peugeot",
};

/** Capitaliza o que não está na tabela, para "FIAT" não virar título gritado. */
function titulo(v: string): string {
  return v
    .toLowerCase()
    .replace(/(^|[\s/-])([a-zà-ú])/g, (_, pre, ch) => pre + ch.toUpperCase());
}

export function normalizaMarca(bruto: string): string {
  const limpo = (bruto ?? "").trim();
  return MARCA[chaveDe(limpo)] ?? titulo(limpo);
}

/**
 * Combustível: o CRM aceita texto livre e a loja escreveu de quatro formas
 * diferentes a mesma coisa. Contagem real de 20/10:
 *
 *     Álcool/Gasolina     16
 *     Flex                10
 *     ALCOOL / GASOLINA    6
 *     GASOLINA/ALCOOL      1
 *     Gasolina             3
 *     Diesel               1
 *
 * As quatro primeiras são Flex. Deixar passar cru faria o filtro de
 * combustível mostrar quatro opções que são a mesma, cada uma escondendo
 * parte do estoque.
 */
function normalizaCombustivel(bruto: string): Fuel {
  const k = chaveDe(bruto ?? "");
  if (!k) return "Flex";
  if (k.includes("alcool") && k.includes("gasolina")) return "Flex";
  if (k.includes("etanol") && k.includes("gasolina")) return "Flex";
  if (k.includes("flex")) return "Flex";
  if (k.includes("hibrido")) return "Híbrido";
  if (k.includes("eletric") || k.includes("eletrico")) return "Elétrico";
  if (k.includes("diesel")) return "Diesel";
  if (k.includes("etanol") || k.includes("alcool")) return "Etanol";
  if (k.includes("gasolina")) return "Gasolina";
  return "Flex";
}

/** Câmbio: o CRM já grava "Manual" e "Automático", que o site aceita. */
function normalizaCambio(bruto: string): Transmission {
  const k = chaveDe(bruto ?? "");
  if (k.includes("cvt")) return "CVT";
  if (k.includes("automatizado")) return "Automatizado";
  if (k.includes("automat")) return "Automático";
  return "Manual";
}

/**
 * Carroceria — o campo que o CRM não tem e o site precisa.
 *
 * `vehicle_type` do CRM é carro/moto/caminhonete, que é outra coisa: não
 * separa hatch de sedã, e é disso que vivem os filtros do /estoque.
 *
 * A tabela abaixo cobre os 37 veículos à venda em 20/10. É uma ponte, não a
 * solução: o certo é uma coluna `body_type` no CRM, preenchida por quem
 * cadastra o carro e sabe o que ele é. Enquanto ela não existe, modelo novo
 * que não esteja aqui cai em `PADRAO` e aparece no site — aparecer
 * classificado de menos é melhor que não aparecer.
 */
const CARROCERIA: Array<[RegExp, BodyType]> = [
  // Motos primeiro: "CG 160" e "BIZ 125" não podem cair em regra de carro.
  [/\b(biz|cg|fazer|ys|pop|titan|fan|xre|bros|factor|cb|hornet)\b/i, "Moto"],

  [/\b(s10|saveiro|hilux|ranger|toro|strada|montana|amarok|frontier|l200)\b/i, "Picape"],
  [/\b(tracker|tiggo|creta|hr-?v|hrv|renegade|compass|impreza|xv|t-?cross|kicks|duster|ecosport|captur|2008|3008|pulse|fastback)\b/i, "SUV"],
  [/\b(prisma|onix\s*plus|siena|city|civic|hb20s|voyage|versa|virtus|cronos|grand\s*siena|corolla|sentra|jetta|vectra|classic|cobalt|logan|fusca)\b/i, "Sedã"],
  [/\b(parati|quantum|spacefox|sw4?|golf\s*variant|palio\s*weekend|idea)\b/i, "Perua"],
  [/\b(veloster|tt|camaro|mustang)\b/i, "Cupê"],
  [/\b(kombi|doblo|partner|berlingo|fiorino|express)\b/i, "Utilitário"],
  [/\b(onix|golf|kwid|sandero|agile|punto|uno|ka|celta|corsa|c3|fox|gol|fiesta|march|mobi|argo|polo|hb20|up|a3|bravo|stilo|fit|march)\b/i, "Hatch"],
];

const PADRAO: BodyType = "Hatch";

function normalizaCarroceria(modelo: string, versao: string, tipo: string): BodyType {
  if (chaveDe(tipo) === "moto") return "Moto";
  if (chaveDe(tipo).includes("caminhonete")) return "Picape";

  const texto = `${modelo ?? ""} ${versao ?? ""}`;
  for (const [padrao, carroceria] of CARROCERIA) {
    if (padrao.test(texto)) return carroceria;
  }
  return PADRAO;
}

/**
 * Portas. O CRM não tem o campo, e chutar errado é informação errada num
 * filtro — então o valor sai do que o próprio tipo de veículo define, e o
 * resto fica em 4, que é o que esses hatches e sedãs são.
 */
function portasDe(carroceria: BodyType): number {
  if (carroceria === "Moto") return 0;
  if (carroceria === "Cupê") return 3;
  return 4;
}

/* -------------------------------------------------------------------------- */
/*  Mapeamento                                                                */
/* -------------------------------------------------------------------------- */

function fotosDe(v: FeedVeiculo, marca: string, modelo: string): VehicleImage[] {
  return (v.fotos ?? [])
    .filter(Boolean)
    .slice(0, FOTOS_POR_VEICULO)
    .map((src, i) => ({
      src,
      alt: `${marca} ${modelo} — foto ${i + 1}`,
      // O feed não manda dimensão. 1600x1000 é a proporção que o grid e a
      // galeria já assumem para as fotos do painel, então o layout não muda.
      width: 1600,
      height: 1000,
    }));
}

/**
 * Um veículo do feed no formato que o site inteiro já consome.
 *
 * `slug` entra de fora: quem chama decide, porque carro que já está no ar
 * precisa MANTER o endereço dele. Gerar slug novo trocaria a URL de cada
 * página e jogaria fora o que o Google já indexou.
 */
export function veiculoDoFeed(v: FeedVeiculo, slug: string): Vehicle {
  const marca = normalizaMarca(v.marca);
  const modelo = (v.modelo ?? "").trim();
  const carroceria = normalizaCarroceria(modelo, v.versao, v.tipo);
  const ano = Number(v.ano) || 0;

  return {
    id: v.id,
    slug,
    brand: marca,
    model: modelo,
    version: (v.versao ?? "").trim(),
    yearManufacture: ano,
    // O feed manda um ano só. Igualar os dois é melhor que inventar o de
    // modelo: o site mostra "2015/2015" em vez de uma informação errada.
    yearModel: ano,
    mileage: Number(v.km) || 0,
    price: v.preco === null || v.preco === undefined ? null : Number(v.preco),
    transmission: normalizaCambio(v.cambio),
    fuel: normalizaCombustivel(v.combustivel),
    color: (v.cor ?? "").trim(),
    doors: portasDe(carroceria),
    bodyType: carroceria,
    description: (v.descricao ?? "").trim(),
    features: [],
    images: fotosDe(v, marca, modelo),
    videoUrl: v.video ?? undefined,
    panoramaUrl: undefined,
    featured: false,
    status: "available",
    createdAt: v.entrou_em,
  };
}

/* -------------------------------------------------------------------------- */
/*  Leitura                                                                   */
/* -------------------------------------------------------------------------- */

/** Sem a variável, nada neste arquivo roda e o site segue como antes. */
export const feedUrl = (process.env.CRM_FEED_URL ?? "").trim();
export const feedConfigurado = Boolean(feedUrl);

/** Host do CRM, para o next.config autorizar as fotos. Null se não houver feed. */
export function feedHost(): string | null {
  try {
    return feedUrl ? new URL(feedUrl).hostname : null;
  } catch {
    return null;
  }
}

/**
 * Busca o estoque no CRM.
 *
 * Devolve `null` em qualquer problema — rede, token revogado, loja suspensa
 * (o feed responde 402 nesse caso, de propósito, para o site poder manter o
 * que já tem). `null` é diferente de lista vazia: quem chama usa isso para
 * cair no banco do próprio site em vez de apagar a vitrine.
 */
export async function buscarEstoqueDoCrm(): Promise<FeedVeiculo[] | null> {
  if (!feedConfigurado) return null;

  try {
    const r = await fetch(feedUrl, {
      // O feed já manda `max-age=300`. Repetir aqui mantém o mesmo prazo se
      // alguém mexer no cache do fetch.
      next: { revalidate: 300 },
      headers: { accept: "application/json" },
    });

    if (!r.ok) return null;

    const corpo = (await r.json()) as FeedResposta;
    const lista = corpo?.veiculos;
    if (!Array.isArray(lista) || lista.length === 0) return null;

    return lista;
  } catch {
    return null;
  }
}
