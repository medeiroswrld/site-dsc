"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The panel's error boundary.
 *
 * Separate from the site's because the audience is different: the person here
 * is trying to publish a car, and the useful thing is the occurrence code to
 * pass on, not a friendly detour to the stock list.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "admin.render_failed",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-fg">
        O painel encontrou um erro
      </h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
        Nada do que você já salvou foi perdido. Tente de novo; se repetir,
        mande o código abaixo para quem cuida do site.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary btn-md">
          Tentar de novo
        </button>
        <Link href="/admin" className="btn btn-secondary btn-md">
          Voltar ao estoque
        </Link>
      </div>

      {error.digest && (
        <p className="plate mt-9 text-[0.75rem] text-fg-subtle">
          Código da ocorrência: {error.digest}
        </p>
      )}
    </div>
  );
}
