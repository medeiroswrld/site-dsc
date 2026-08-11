-- ============================================================================
-- D.S.C. SEMINOVOS — seção do Instagram
--
-- COMO USAR (uma vez só):
--   1. Abra o SQL Editor do projeto no Supabase.
--   2. Cole este arquivo inteiro e clique em RUN.
--   3. Vá em /admin/instagram e suba as fotos.
--
-- As fotos ficam no mesmo bucket "veiculos", sob o prefixo "instagram/".
-- ============================================================================

create table if not exists public.instagram_posts (
  id          uuid primary key default gen_random_uuid(),
  -- Caminho dentro do bucket "veiculos", ex: "instagram/1786-0.webp".
  path        text not null,
  -- Link da publicação. Em branco, o card abre o perfil.
  url         text,
  alt         text not null default '',
  position    integer not null default 0,
  width       integer,
  height      integer,
  created_at  timestamptz not null default now()
);

create index if not exists instagram_posts_position_idx
  on public.instagram_posts (position);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Mesma regra dos veículos: o site lê com a chave anônima, e a escrita só
-- acontece pelo servidor com a service role, que ignora RLS. Por isso não há
-- policy de escrita — ninguém grava pelo navegador.
-- ---------------------------------------------------------------------------
alter table public.instagram_posts enable row level security;

drop policy if exists "leitura publica do instagram" on public.instagram_posts;
create policy "leitura publica do instagram"
  on public.instagram_posts for select
  to anon, authenticated
  using (true);
