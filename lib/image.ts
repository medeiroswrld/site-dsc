/**
 * Client-side photo preparation.
 *
 * A phone camera produces 3–8 MB files at 4000px wide. The site never renders
 * a vehicle photo larger than ~1600px, so shipping the original wastes the
 * seller's mobile data, the storage bill and the buyer's page load. Downscaling
 * in the browser before upload turns a 6 MB file into roughly 300 KB with no
 * visible difference at the sizes we display.
 */

export interface PreparedPhoto {
  blob: Blob;
  name: string;
  type: string;
  width: number;
  height: number;
  originalSize: number;
}

/**
 * 2560px on the long edge covers a full-screen lightbox on a 2× laptop with
 * room to spare, which is the largest the site ever shows a photo.
 */
const MAX_EDGE = 2560;

/**
 * Encoded high on purpose. This file is not what the visitor downloads —
 * next/image re-encodes it on the way out — so anything lost here is lost
 * twice. Storage is cheap; a mushy wheel arch costs a sale.
 */
const QUALITY = 0.94;

/** SVG is stored and served as delivered — see `prepareVector`. */
export const VECTOR_TYPE = "image/svg+xml";

/** Formats we can decode and re-encode. HEIC from iOS is handled by Safari. */
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  VECTOR_TYPE,
];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || file.type.startsWith("image/");
}

/**
 * iPhone grava em HEIC desde 2017, e o formato chega ao painel de dois jeitos:
 * escolhido pelo app Arquivos, ou arrastado de um Mac. Quando o iOS entrega a
 * foto pela galeria ele costuma converter para JPEG sozinho — mas nem sempre,
 * e num computador nunca.
 *
 * O `type` vem vazio em vários sistemas que não conhecem o formato, daí a
 * verificação pela extensão também.
 */
function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name)
  );
}

/**
 * Decodifica HEIC no navegador.
 *
 * Nenhum navegador além do Safari decodifica HEIC nativamente, então
 * `createImageBitmap` falha e a foto ia parar no fallback — subindo como
 * arquivo bruto, que o Storage recusa. Aqui um decodificador em WebAssembly
 * resolve isso.
 *
 * São 3 MB, e por isso o import é dinâmico: só desce quando alguém de fato
 * escolhe um HEIC, e só no painel. Quem envia JPEG nunca paga por ele.
 *
 * A saída é um ImageBitmap, de propósito — assim o HEIC segue exatamente o
 * mesmo caminho das demais fotos: mesma redução, mesma conversão para WebP,
 * mesmo resultado no Storage.
 */
async function decodeHeic(file: File): Promise<ImageBitmap> {
  const { heicTo } = await import("heic-to/next");
  return heicTo({
    blob: file,
    type: "bitmap",
    options: { imageOrientation: "from-image" },
  });
}

/** Some systems hand over an SVG with an empty or generic `type`. */
export function isVectorFile(file: File): boolean {
  return file.type === VECTOR_TYPE || /\.svg$/i.test(file.name);
}

/**
 * True for a source next/image must leave alone.
 *
 * The optimiser refuses SVG unless `dangerouslyAllowSVG` is on, and turning
 * that on to re-encode a file that is already resolution-independent buys
 * nothing. These are served straight from storage instead.
 *
 * Next currently applies the same rule internally, but only as an undocumented
 * special case; saying it out loud here keeps the behaviour ours.
 */
export function isVectorSource(src: string): boolean {
  return /\.svg(?:[?#]|$)/i.test(src);
}

/**
 * Shrinks by halving repeatedly, then does the last partial step.
 *
 * A single `drawImage` from 4032px straight to 2560px asks the browser to
 * throw away most of the pixels in one pass, and its filter is not good enough
 * to do that cleanly — fine detail like grille slats and tyre tread turns to
 * mush. Halving keeps each step within what the filter handles well. The
 * smoothing hint also has to be set explicitly: it defaults to "low".
 */
function downscale(source: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const draw = (
    input: CanvasImageSource,
    width: number,
    height: number,
  ): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(input, 0, 0, width, height);
    }
    return canvas;
  };

  let current: CanvasImageSource = source;
  let currentWidth = source.width;
  let currentHeight = source.height;

  while (Math.max(currentWidth, currentHeight) > maxEdge * 2) {
    currentWidth = Math.round(currentWidth / 2);
    currentHeight = Math.round(currentHeight / 2);
    current = draw(current, currentWidth, currentHeight);
  }

  const scale = Math.min(1, maxEdge / Math.max(currentWidth, currentHeight));
  return draw(
    current,
    Math.round(currentWidth * scale),
    Math.round(currentHeight * scale),
  );
}

/** `100%`, `auto` and `12em` are not intrinsic pixel sizes. */
function svgLength(value: string | null): number {
  if (!value || /[%a-z]/i.test(value.replace(/px$/i, ""))) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

/**
 * SVG goes up exactly as it arrived.
 *
 * There is nothing to downscale and no quality to trade: rasterising a vector
 * to WebP would swap a file that stays sharp at any zoom for one that does not,
 * and would usually come out heavier. Only the intrinsic size is read, so the
 * gallery can reserve the right box before the file loads. Parsing is inert —
 * `DOMParser` builds a detached document and runs nothing inside it.
 */
async function prepareVector(file: File): Promise<PreparedPhoto> {
  const prepared: PreparedPhoto = {
    blob: file,
    name: file.name,
    type: VECTOR_TYPE,
    width: 0,
    height: 0,
    originalSize: file.size,
  };

  if (typeof DOMParser === "undefined") return prepared;

  try {
    const root = new DOMParser()
      .parseFromString(await file.text(), VECTOR_TYPE)
      .querySelector("svg");
    if (!root) return prepared;

    let width = svgLength(root.getAttribute("width"));
    let height = svgLength(root.getAttribute("height"));

    // A viewBox is the more common way to carry the proportions, and the only
    // one left when width/height are percentages.
    if (!width || !height) {
      const box = (root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/);
      if (box.length === 4) {
        width = svgLength(box[2]);
        height = svgLength(box[3]);
      }
    }

    if (width && height) {
      prepared.width = width;
      prepared.height = height;
    }
  } catch {
    // Unreadable markup is still a valid upload; it just goes up unmeasured.
  }

  return prepared;
}

/**
 * Decodes, honours EXIF rotation, fits inside MAX_EDGE and re-encodes as WebP.
 * Returns the original untouched if anything goes wrong — a slightly heavy
 * upload beats a failed one.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (isVectorFile(file)) return prepareVector(file);

  const fallback: PreparedPhoto = {
    blob: file,
    name: file.name,
    type: file.type || "image/jpeg",
    width: 0,
    height: 0,
    originalSize: file.size,
  };

  // Para HEIC o arquivo original não serve de reserva: nenhum navegador além
  // do Safari o exibe, e o Storage nem aceita gravá-lo. Ou a conversão dá
  // certo, ou é preciso dizer isso a quem está enviando.
  const heic = isHeicFile(file);

  if (typeof createImageBitmap !== "function") {
    if (heic) throw new Error("Este navegador não consegue converter fotos HEIC do iPhone.");
    return fallback;
  }

  try {
    // `from-image` applies the EXIF orientation, so portrait phone photos do
    // not arrive sideways.
    const bitmap = isHeicFile(file)
      ? await decodeHeic(file)
      : await createImageBitmap(file, { imageOrientation: "from-image" });

    const wasResized = Math.max(bitmap.width, bitmap.height) > MAX_EDGE;
    const canvas = downscale(bitmap, MAX_EDGE);
    const width = canvas.width;
    const height = canvas.height;
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY),
    );

    if (!blob) {
      if (heic) throw new Error("Não foi possível converter esta foto HEIC.");
      return fallback;
    }

    // An already-small photo that re-encodes larger is better left untouched.
    // Exceto vindo de HEIC: o formato comprime tão bem que o WebP quase sempre
    // sai maior, e devolver o original aqui significaria recusa no Storage.
    if (!heic && blob.size >= file.size && !wasResized) return fallback;

    return {
      blob,
      name: file.name.replace(/\.[^.]+$/, "") + ".webp",
      type: "image/webp",
      width,
      height,
      originalSize: file.size,
    };
  } catch (error) {
    // A falha do HEIC precisa chegar a quem enviou: cair no fallback aqui
    // produziria "formato não aceito" lá na frente, depois da espera, sem
    // pista nenhuma de que o problema foi a conversão.
    if (heic) {
      throw error instanceof Error
        ? error
        : new Error("Não foi possível converter esta foto HEIC.");
    }
    return fallback;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
