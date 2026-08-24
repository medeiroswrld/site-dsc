import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * A 404 na raiz da aplicação.
 *
 * Existe porque `dynamicParams: false` recusa a rota no roteamento, antes de
 * qualquer layout: a tela de 404 do grupo (site) nunca é alcançada, e sem esta
 * o visitante recebe a página cinza padrão do Next. É o caminho que um link
 * antigo de veículo vendido percorre, que é justamente o caso mais provável de
 * 404 neste site.
 *
 * O projeto não tem layout na raiz — cada grupo traz o seu — então esta página
 * monta o próprio documento, e os estilos vão inline em vez de virem do
 * Tailwind, que não está montado aqui.
 */
export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          background: "#08080a",
          color: "#f2f2f4",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "34rem", margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.6875rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8a8a93",
            }}
          >
            Erro 404
          </p>

          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Esta página não existe.
          </h1>

          <p style={{ marginTop: "1.25rem", lineHeight: 1.6, color: "#b4b4bb" }}>
            O endereço pode ter mudado, ou o veículo que você procurava já saiu
            do estoque. Veja o que está disponível agora ou fale com a equipe.
          </p>

          <div
            style={{
              marginTop: "2.25rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <Link
              href="/estoque"
              style={{
                background: "#f4661b",
                color: "#0a0a0c",
                borderRadius: "999px",
                padding: "0.875rem 1.75rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Ver estoque
            </Link>
            <Link
              href="/contato"
              style={{
                border: "1px solid #6c6c79",
                color: "#f2f2f4",
                borderRadius: "999px",
                padding: "0.875rem 1.75rem",
                textDecoration: "none",
              }}
            >
              Falar com a {siteConfig.shortName}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
