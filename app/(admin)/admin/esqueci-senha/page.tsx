import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";
import { CarMark } from "@/components/layout/Wordmark";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured) redirect("/admin/configurar");

  return (
    <div className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <CarMark className="h-7 w-auto" />

        <h1 className="mt-7 font-display text-[1.625rem] font-semibold tracking-[-0.03em] text-fg">
          Esqueceu a senha?
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Informe o e-mail da conta e enviamos um link para você criar uma nova.
        </p>

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
