import { AdminShell } from "@/components/admin/AdminShell";
import { InstagramManager } from "@/components/admin/InstagramManager";
import { requireAdmin } from "@/lib/admin/auth";
import { photoUrl } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  path: string;
  url: string | null;
}

export default async function AdminInstagramPage() {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("instagram_posts")
    .select("id, path, url")
    .order("position", { ascending: true });

  // The table only exists after supabase/instagram.sql has been run, so say so
  // instead of showing an empty manager that silently fails on upload.
  if (error) {
    return (
      <AdminShell
        title="Instagram"
        description="Fotos que aparecem no carrossel da página inicial."
        backHref="/admin"
        backLabel="Estoque"
      >
        <div className="rounded-2xl border border-brand/40 bg-brand/10 p-6">
          <h2 className="font-display text-[1.125rem] font-semibold text-fg">
            Falta rodar o script do Instagram
          </h2>
          <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
            Abra o SQL Editor do Supabase, cole o conteúdo de{" "}
            <span className="plate text-fg">supabase/instagram.sql</span> e
            clique em Run. Depois recarregue esta página.
          </p>
          <p className="mt-3 text-[0.8125rem] text-fg-subtle">
            Detalhe técnico: {error.message}
          </p>
        </div>
      </AdminShell>
    );
  }

  const posts = (data as PostRow[]).map((row) => ({
    id: row.id,
    url: photoUrl(row.path),
    link: row.url ?? "",
  }));

  return (
    <AdminShell
      title="Instagram"
      description={`Fotos do carrossel da página inicial. O botão do perfil sempre aponta para ${siteConfig.instagram.handle}.`}
      backHref="/admin"
      backLabel="Estoque"
    >
      <InstagramManager posts={posts} />
    </AdminShell>
  );
}
