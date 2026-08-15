"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * What a visitor sees when a page throws.
 *
 * Next replaces the real message with a `digest` in production — the same
 * digest appears in the server log for that request, which is what lets
 * support tie a screenshot to a stack trace without ever showing the visitor
 * anything about the database.
 *
 * The tone is deliberate: a car buyer who hits this should be pointed back at
 * the stock or at WhatsApp, not left staring at an apology.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reaches the browser console and any front-end monitoring; the server
    // side of the same failure is already logged with this digest.
    console.error(
      JSON.stringify({
        level: "error",
        event: "client.render_failed",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <Container size="narrow" className="py-28 lg:py-36">
      <p className="eyebrow">Erro</p>
      <h1 className="display-3 mt-4">Algo quebrou nesta página</h1>
      <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-fg-muted">
        A falha foi registrada e a equipe consegue ver o que aconteceu. Você
        pode tentar de novo — se persistir, fale com a gente no WhatsApp que
        resolvemos por lá.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary btn-md">
          Tentar de novo
        </button>
        <Link href="/estoque" className="btn btn-secondary btn-md">
          Ver o estoque
        </Link>
      </div>

      {error.digest && (
        <p className="plate mt-10 text-[0.75rem] text-fg-subtle">
          Código da ocorrência: {error.digest}
        </p>
      )}
    </Container>
  );
}
