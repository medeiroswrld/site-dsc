import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { CarMark } from "@/components/layout/Wordmark";
import { PendingLink } from "@/components/ui/PendingLink";
import { signOut } from "@/lib/admin/session-actions";

/**
 * Frame shared by every screen in the panel. Deliberately plainer than the
 * public site: this is a tool someone opens to get a car listed, so density
 * and clarity beat atmosphere.
 */
export function AdminShell({
  title,
  description,
  actions,
  children,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
          {/* Linha 1: identidade e as duas ações que valem em qualquer tela. */}
          <div className="flex h-14 items-center gap-4 sm:h-16">
            <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
              <CarMark className="h-5 w-auto" />
              <span className="plate text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle">
                Painel
              </span>
            </Link>

            {/* No desktop as abas voltam para a mesma linha; no celular elas
                ficam na linha de baixo, que rola sozinha. */}
            <AdminNav className="ml-auto hidden sm:flex" />

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-4">
              <Link
                href="/"
                target="_blank"
                className="rounded-full px-3 py-2 text-[0.8125rem] text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
              >
                Ver o site
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-[0.8125rem] text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>

          <AdminNav className="pb-2 sm:hidden" />
        </div>
      </header>

      <main className="mx-auto max-w-[80rem] px-5 pb-24 pt-9 sm:px-8">
        {backHref && (
          <PendingLink
            href={backHref}
            className="plate mb-6 inline-flex items-center gap-1.5 text-[0.75rem] text-fg-subtle underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            {backLabel ? `Voltar para ${backLabel.toLowerCase()}` : "Voltar"}
          </PendingLink>
        )}

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-fg sm:text-[2rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>

        <div className="mt-9">{children}</div>
      </main>
    </div>
  );
}
