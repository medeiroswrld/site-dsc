import { ImageResponse } from "next/og";
import sharp from "sharp";
import { formatMileage, formatPrice, formatYear, vehicleTitle } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { getVehicleBySlug } from "@/lib/vehicles-repository";

/**
 * The card that shows up when a vehicle link is pasted into WhatsApp.
 *
 * This is the one that earns its keep. Every link the team sends a customer
 * goes through here, and so does every forward to a spouse or a parent — which
 * is how a used car actually gets decided. A link with the car in it is a
 * different message from a link with a grey rectangle.
 *
 * It is generated per request from the same database the page uses, so a price
 * change is reflected without anyone regenerating anything.
 */
/**
 * Node, not Edge: the photo has to be transcoded before it can be composed,
 * and that needs sharp.
 */
export const runtime = "nodejs";

export const alt = "Veículo à venda na D.S.C. Seminovos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/**
 * Fetches the cover photo, cropped to the card.
 *
 * Two problems are solved outside the composer rather than inside it.
 *
 * ImageResponse cannot decode WebP, which is what every photo uploaded through
 * the panel is — the browser converts on the way up. Passing the storage URL
 * straight in produced a card with the type over plain black, silently.
 *
 * And ImageResponse only ever emits PNG. A PNG of a photograph came out at
 * 686 kB even after blurring and dropping quality, heavy enough that WhatsApp
 * may skip the preview entirely. So the composer draws only the caption, on
 * transparency — flat colour, which PNG handles well — and sharp lays it over
 * the photo and writes a JPEG.
 */
async function coverPhoto(src: string): Promise<Buffer | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;

    // ImageResponse only ever emits PNG, and a PNG of a photograph is large.
    // Feeding it a smaller, softer JPEG is the one lever available: the card is
    // seen at thumbnail size in a chat, and WhatsApp gives up on heavy files.
    return await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(size.width, size.height, { fit: "cover", position: "attention" })
      .toBuffer();
  } catch {
    // A card with no photo still reads; a failed render does not.
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  // A missing car still needs a card: a broken image in a chat is worse than a
  // plain one, and the link may have been forwarded after the car was sold.
  if (!vehicle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#08080a",
            color: "#f2f2f4",
            fontSize: 56,
            fontWeight: 600,
          }}
        >
          {siteConfig.name}
        </div>
      ),
      size,
    );
  }

  const photo = vehicle.images[0];
  const background =
    photo && !photo.isPlaceholder ? await coverPhoto(photo.src) : null;

  const specs = [
    formatYear(vehicle),
    formatMileage(vehicle.mileage),
    vehicle.transmission,
  ].join("  ·  ");

  const caption = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          // Transparent when there is a photo to sit on; the shop's black when
          // there is not, so the card is never see-through.
          background: background ? "transparent" : "#08080a",
        }}
      >
        {/* The photo is whatever the shop uploaded — a silver car under a
            midday sky is the normal case, not the exception — so the type gets
            its own ground instead of trusting the image to be dark where it
            lands. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "180px 64px 56px",
            background:
              "linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.72) 38%, rgba(8,8,10,0.97) 72%)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#f4661b",
              fontWeight: 700,
            }}
          >
            {siteConfig.shortName} Seminovos
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 62,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              marginTop: 14,
            }}
          >
            {vehicleTitle(vehicle)}
          </div>

          <div
            style={{ display: "flex", alignItems: "center", marginTop: 22, gap: 28 }}
          >
            <div
              style={{ display: "flex", fontSize: 46, fontWeight: 700, color: "#f4661b" }}
            >
              {formatPrice(vehicle.price)}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#d4d4d8" }}>
              {specs}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );

  const overlay = Buffer.from(await caption.arrayBuffer());

  if (!background) {
    // Nothing to composite onto, but still worth re-encoding: a flat card as
    // JPEG is a fraction of the same card as PNG.
    const flat = await sharp(overlay).jpeg({ quality: 86 }).toBuffer();
    return new Response(new Uint8Array(flat), {
      headers: {
        "Content-Type": contentType,
        // Immutable: the URL Next generates already carries a content hash.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const card = await sharp(background)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(card), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
