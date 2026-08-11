import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/admin/NewPasswordForm";
import { CarMark } from "@/components/layout/Wordmark";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Nova senha",
  robots: { index: false, follow: false },
};

/**
 * Where the recovery e-mail lands. The link carries its token in the URL
 * fragment, which never reaches the server — so this page is deliberately
 * public and the form decides, client-side, whether the link was valid.
 */
export default function NewPasswordPage() {
  if (!isSupabaseConfigured) redirect("/admin/configurar");

  return (
    <div className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <CarMark className="h-7 w-auto" />

        <h1 className="mt-7 font-display text-[1.625rem] font-semibold tracking-[-0.03em] text-fg">
          Criar nova senha
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Escolha a senha que você vai usar para entrar no painel.
        </p>

        <div className="mt-8">
          <NewPasswordForm />
        </div>
      </div>
    </div>
  );
}
