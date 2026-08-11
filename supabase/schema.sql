-- ============================================================================
-- D.S.C. SEMINOVOS — esquema do banco
--
-- COMO USAR (uma vez só):
--   1. Crie um projeto em https://supabase.com (plano gratuito serve).
--   2. Abra o SQL Editor do projeto.
--   3. Cole este arquivo inteiro e clique em RUN.
--   4. Vá em Storage e confirme que o bucket "veiculos" foi criado.
--   5. Vá em Authentication > Users > Add user, crie o e-mail e a senha que
--      você vai usar para entrar no painel, e marque "Auto Confirm User".
--   6. Copie as chaves em Settings > API para o arquivo .env.local
--      (veja .env.example na raiz do projeto).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Veículos
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  brand             text not null,
  model             text not null,
  version           text not null default '',
  year_manufacture  integer not null,
  year_model        integer not null,
  mileage           integer not null default 0,
  -- NULL significa "Sob consulta". Nunca preencha com um valor inventado.
  price             integer,
  transmission      text not null,
  fuel              text not null,
  color             text not null default '',
  doors             integer not null default 4,
  body_type         text not null,
  description       text not null default '',
  features          text[] not null default '{}',
  video_url         text,
  panorama_url      text,
  featured          boolean not null default false,
  status            text not null default 'available'
                      check (status in ('available', 'reserved', 'sold')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists vehicles_status_idx    on public.vehicles (status);
create index if not exists vehicles_created_idx   on public.vehicles (created_at desc);
create index if not exists vehicles_brand_idx     on public.vehicles (brand);

-- ---------------------------------------------------------------------------
-- Fotos — uma linha por imagem, `position` define a ordem da galeria.
-- A primeira (position = 0) é a capa usada nos cards e no compartilhamento.
-- ---------------------------------------------------------------------------
create table if not exists public.vehicle_images (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references public.vehicles (id) on delete cascade,
  -- Caminho dentro do bucket "veiculos", ex: "abc-123/0-frente.jpg".
  path        text not null,
  alt         text not null default '',
  position    integer not null default 0,
  width       integer,
  height      integer,
  created_at  timestamptz not null default now()
);

create index if not exists vehicle_images_vehicle_idx
  on public.vehicle_images (vehicle_id, position);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_touch_updated_at on public.vehicles;
create trigger vehicles_touch_updated_at
  before update on public.vehicles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- O site público lê com a chave anônima e só enxerga o que está publicado.
-- O painel escreve pelo servidor com a service role, que ignora RLS — por isso
-- não existe policy de escrita aqui: ninguém consegue gravar pelo navegador.
-- ---------------------------------------------------------------------------
alter table public.vehicles       enable row level security;
alter table public.vehicle_images enable row level security;

drop policy if exists "leitura publica dos veiculos" on public.vehicles;
create policy "leitura publica dos veiculos"
  on public.vehicles for select
  to anon, authenticated
  using (true);

drop policy if exists "leitura publica das fotos" on public.vehicle_images;
create policy "leitura publica das fotos"
  on public.vehicle_images for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage: bucket público das fotos dos veículos
-- ---------------------------------------------------------------------------
-- Os tipos aqui têm que bater com STORAGE_EXTENSIONS em lib/supabase/config.ts:
-- o que faltar nesta lista o Storage recusa, por mais que o painel aceite.
-- Se o bucket já existe, rode este arquivo de novo — o "on conflict" abaixo
-- atualiza a lista sem apagar nenhuma foto.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'veiculos', 'veiculos', true,
  10485760,                                  -- 10 MB por arquivo
  array['image/webp','image/jpeg','image/png','image/avif','image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "leitura publica das fotos no storage" on storage.objects;
create policy "leitura publica das fotos no storage"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'veiculos');
