-- ============================================================================
-- D.S.C. SEMINOVOS — conteúdo editável pelo painel
--
-- COMO USAR (uma vez só):
--   1. Abra o SQL Editor do projeto no Supabase.
--   2. Cole este arquivo inteiro e clique em RUN.
--   3. Vá em /admin/conteudo e troque as imagens e os dados da loja.
--
-- Rodar de novo é seguro: nada aqui apaga conteúdo já cadastrado.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Imagens e vídeo do site
--
-- Uma linha por espaço nomeado ("slot") do layout. Sem linha, o site usa o
-- arquivo que está no código — é o que segura o layout enquanto a loja não
-- mandou a foto de verdade.
-- ---------------------------------------------------------------------------
create table if not exists public.site_media (
  slot        text primary key,
  -- Caminho dentro do bucket "veiculos", ex: "site/facade-1786.webp".
  path        text not null,
  alt         text not null default '',
  width       integer,
  height      integer,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Dados da loja: telefone, endereço, horários, avaliação.
--
-- Chave/valor em jsonb porque os tipos variam — texto, número e a lista de
-- horários convivem na mesma tabela. O que não estiver aqui cai no padrão de
-- lib/site.ts, então o site nunca fica sem informação.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
drop trigger if exists site_media_touch on public.site_media;
create trigger site_media_touch
  before update on public.site_media
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: leitura pública, escrita só pela service_role
-- ---------------------------------------------------------------------------
alter table public.site_media    enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "leitura publica das imagens do site" on public.site_media;
create policy "leitura publica das imagens do site"
  on public.site_media for select
  to anon, authenticated
  using (true);

drop policy if exists "leitura publica dos dados da loja" on public.site_settings;
create policy "leitura publica dos dados da loja"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage: o bucket passa a aceitar o vídeo do topo da home
--
-- 50 MB é o teto do plano gratuito do Supabase. Um filme de fundo bem
-- comprimido fica bem abaixo disso — acima de ~10 MB o visitante de celular
-- sente no carregamento.
-- ---------------------------------------------------------------------------
update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/webp','image/jpeg','image/png','image/avif','image/svg+xml',
    'video/mp4','video/webm'
  ]
where id = 'veiculos';
