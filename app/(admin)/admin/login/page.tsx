import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { CarMark } from "@/components/layout/Wordmark";
import { getAdminUser } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  if (!isSupabaseConfigured) redirect("/admin/configurar");

  const { proximo } = await searchParams;
  const user = await getAdminUser();
  if (user) redirect(proximo || "/admin");

  return (
    <div className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <CarMark className="h-7 w-auto" />

        <h1 className="mt-7 font-display text-[1.625rem] font-semibold tracking-[-0.03em] text-fg">
          Painel da D.S.C.
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Entre para cadastrar e editar os veículos do estoque.
        </p>

        <div className="mt-8">
          <LoginForm nextPath={proximo || "/admin"} />
        </div>
      </div>
    </div>
  );
}
