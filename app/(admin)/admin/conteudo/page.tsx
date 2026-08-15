import { AdminShell } from "@/components/admin/AdminShell";
import { SiteMediaManager } from "@/components/admin/SiteMediaManager";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { requireAdmin } from "@/lib/admin/auth";
import { MEDIA_SLOTS } from "@/lib/site-content";
import { getSiteMedia, getStoreInfo } from "@/lib/site-content-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();

  // The tables only exist after supabase/conteudo.sql has been run. Probing
  // once here means the page can say so, instead of showing a manager whose
  // every button fails with a database error.
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_media").select("slot").limit(1);

  if (error) {
    return (
      <AdminShell
        title="Site"
        description="Imagens, vídeo e dados da loja."
        backHref="/admin"
        backLabel="Estoque"
      >
        <div className="rounded-2xl border border-brand/40 bg-brand/10 p-6">
          <h2 className="font-display text-[1.125rem] font-semibold text-fg">
            Falta rodar o script do conteúdo
          </h2>
          <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
            Abra o SQL Editor do Supabase, cole o conteúdo de{" "}
            <span className="plate text-fg">supabase/conteudo.sql</span> e
            clique em Run. Depois recarregue esta página.
          </p>
          <p className="mt-3 text-[0.8125rem] text-fg-subtle">
            Detalhe técnico: {error.message}
          </p>
        </div>
      </AdminShell>
    );
  }

  const [media, store] = await Promise.all([getSiteMedia(), getStoreInfo()]);

  return (
    <AdminShell
      title="Site"
      description="Imagens, vídeo e dados da loja."
      backHref="/admin"
      backLabel="Estoque"
    >
      <section>
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.025em] text-fg">
          Imagens do site
        </h2>
        <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-fg-muted">
          Cada espaço abaixo é um lugar fixo do layout. Enquanto você não enviar
          uma foto, o site mostra um desenho de marcação no lugar — nada quebra,
          mas também não convence ninguém.
        </p>

        <SiteMediaManager slots={MEDIA_SLOTS} media={media} />
      </section>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.025em] text-fg">
          Dados da loja
        </h2>
        <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-fg-muted">
          Telefone, endereço, horários e avaliação. Mudam o site inteiro de uma
          vez, inclusive o que o Google lê para mostrar a loja na busca.
        </p>

        <StoreSettingsForm store={store} />
      </section>
    </AdminShell>
  );
}
