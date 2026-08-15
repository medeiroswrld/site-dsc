"use client";

import { useEffect } from "react";

/**
 * Last resort: the root layout itself failed.
 *
 * This replaces <html> entirely, so it cannot use the site's layout, fonts or
 * components — none of them are mounted at this point. Everything here is
 * inline on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "fatal",
        event: "root.render_failed",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080a",
          color: "#f2f2f4",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0, letterSpacing: "-0.03em" }}>
            O site está fora do ar no momento
          </h1>
          <p style={{ color: "#b4b4bb", lineHeight: 1.6, marginTop: "1rem" }}>
            A falha foi registrada. Tente recarregar em alguns instantes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              background: "#f4661b",
              color: "#0a0a0c",
              border: 0,
              borderRadius: "999px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.9375rem",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
          {error.digest && (
            <p style={{ color: "#8a8a93", fontSize: "0.75rem", marginTop: "2rem" }}>
              Código da ocorrência: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
