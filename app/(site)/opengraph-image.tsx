import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

/**
 * The card for every page that is not a vehicle: home, stock, financing,
 * "venda seu carro", about and contact.
 *
 * Drawn rather than photographed, on purpose. A generic storefront photo would
 * compete with the vehicle cards for attention and say less — here the job is
 * to identify the shop and the city in the half second someone spends looking
 * at a link preview.
 */
export const alt = `${siteConfig.name} — seminovos em ${siteConfig.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#08080a",
          position: "relative",
        }}
      >
        {/* One orange rule, the same accent the site uses, so the card reads as
            part of the brand and not as a default. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: "#f4661b",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
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
            fontSize: 78,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.05,
            marginTop: 20,
            maxWidth: 900,
          }}
        >
          Seminovos em {siteConfig.city}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#b4b4bb",
            marginTop: 26,
            maxWidth: 860,
            lineHeight: 1.35,
          }}
        >
          Veículos selecionados, financiamento e atendimento direto da equipe.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#8a8a93",
            marginTop: 44,
            letterSpacing: 2,
          }}
        >
          {siteConfig.city} · {siteConfig.state}
        </div>
      </div>
    ),
    size,
  );
}
