# D.S.C. Seminovos

Site da D.S.C. Seminovos — loja de veículos seminovos em Itapetininga, São Paulo.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run typecheck
```

---

## O que precisa ser substituído antes de publicar

O site está completo. O que falta é material da própria loja. Cada item abaixo
tem um lugar definido no código e um placeholder claramente identificado no
lugar — nada foi inventado para preencher espaço.

### 1. Vídeo do hero (prioridade)

O primeiro viewport da home foi construído para um vídeo de apresentação da
loja: fachada, entrada, showroom, veículos, oficina, movimento real.

| Arquivo | Formato |
| --- | --- |
| `public/media/hero.mp4` | H.264, ~1920×1080, **sem faixa de áudio**, 12–25 s em loop |
| `public/media/hero.webm` | opcional, VP9/AV1 — arquivo menor no Chrome |
| `public/media/hero-poster.jpg` | primeiro quadro, comprimido |

Depois de colocar os arquivos, em `lib/site.ts` → `media`:

- mude `hasHeroVideo` para `true`. Enquanto for `false` o `<video>` nem é
  montado, então o navegador não pinta um quadro quebrado atrás do hero;
- aponte `heroPoster` para `/media/hero-poster.jpg`.

O `<video>` só monta depois da primeira pintura e se remove sozinho caso a
fonte falhe, então nada quebra em nenhum dos dois casos. Quem tiver
`prefers-reduced-motion` ativo vê o poster com um botão para dar play.

### 2. Fotografia

Todos os placeholders estão em `public/placeholders/` e são preenchimentos
técnicos neutros — nunca fotos artificiais de carros.

| Placeholder | Substituir por |
| --- | --- |
| `vehicle-01…04.svg` | fotos reais de cada veículo |
| `facade.svg` | fachada da loja |
| `showroom.svg` | showroom por dentro |
| `workshop.svg`, `workshop-detail.svg` | oficina própria |
| `team.svg` | equipe |
| `store-front.svg` | entrada / pátio |
| `social-01…06.svg` | seis publicações recentes do @dsc_seminovos |

Ao trocar por fotos reais, remova o campo `isPlaceholder` do registro da imagem:
é ele que faz o `next/image` pular o otimizador e que impede a foto de entrar no
schema.org. Com fotos reais, o AVIF/WebP e o `srcset` passam a valer.

### 3. Logo

O logo oficial da loja está no site. `components/layout/Wordmark.tsx` serve a
arte original; o carro sozinho (`CarMark`) é o que o painel usa e também o ícone
da aba, em `app/icon.png`.

| Arquivo em `public/brand/` | Uso |
| --- | --- |
| `dsc-seminovos.png` | lockup com a lettering prateada — **é o que o site usa** |
| `dsc-seminovos-dark.png` | lockup original, lettering preta, para fundo claro |
| `dsc-mark.png` | só o carro laranja |

Os três saíram do mesmo arquivo entregue pela loja, recortados no limite da
arte e com fundo transparente. A única edição foi levantar a lettering de preto
para o prateado do site (`--color-fg`) — sem isso ela sumiria no fundo preto. O
laranja é o do arquivo original, intocado.

Se um dia chegar o logo em vetor (SVG), é só trocar os `<Image>` do `Wordmark`:
as proporções são as mesmas.

### 4. Conectar o banco (e ligar o painel)

Enquanto não houver Supabase configurado, o site roda com **12 veículos
fictícios** de `data/vehicles.ts` e mostra uma faixa avisando disso. A faixa
some sozinha assim que o banco entra — não há flag para lembrar de desligar.

Abra **http://localhost:3000/admin** e a tela de configuração lista os quatro
passos. Em resumo:

1. Criar um projeto gratuito em [supabase.com](https://supabase.com), região
   South America (São Paulo).
2. Colar `supabase/schema.sql` no SQL Editor e rodar. Cria as tabelas, o bucket
   de fotos e as regras de acesso.
3. Em Authentication › Users › Add user, criar o e-mail e a senha do painel
   (marcando *Auto Confirm User*).
4. Copiar as três chaves de Settings › API para um `.env.local` — o formato
   está em `.env.example` — e reiniciar o servidor.

### 5. Dados comerciais a confirmar

Em `lib/site.ts`:

- `url` — domínio de produção (usado em canonical, sitemap e schema).
- `whatsapp` — número do WhatsApp da loja. **Hoje está o fixo como provisório.**
- `googleReviewsUrl` — link do perfil real no Google Meu Negócio.
- `geo` — coordenadas exatas do pino no Maps.
- `hours` — confirmar os horários de atendimento.

Em `app/(site)/politica-de-privacidade/page.tsx`: razão social, CNPJ e e-mail
para solicitações de dados.

---

## O painel

`/admin` — protegido por login, `noindex`, fora do sitemap.

| Tela | O que faz |
| --- | --- |
| `/admin` | Lista o estoque, busca, filtra por situação, e permite trocar situação e destaque direto da linha |
| `/admin/veiculos/novo` | Cadastro: identificação, números, ficha técnica, texto do anúncio e publicação |
| `/admin/veiculos/[id]` | Edição, gerenciamento das fotos e exclusão |
| `/admin/login` | Entrada |
| `/admin/configurar` | Guia que aparece enquanto o Supabase não estiver conectado |

**Fotos.** Envio de várias de uma vez (JPG, PNG, WebP, AVIF ou **SVG**, até
10 MB cada). A ordem é ajustada por setas — funciona no celular e no teclado, ao
contrário de arrastar-e-soltar. A primeira foto é a capa: é ela que vai para os
cards e para o compartilhamento de link.

Foto comum é reduzida no próprio aparelho e vira WebP antes de subir. **SVG sobe
do jeito que veio** — é vetor, não tem pixel para descartar, e rasterizar só
deixaria borrado. Por isso ele também pula o otimizador do `next/image`, que
recusa SVG por padrão, e é servido direto do Storage.

Se o seu projeto Supabase é anterior a essa mudança, o bucket ainda vai recusar
SVG com um erro de "mime type". Rode `supabase/schema.sql` de novo no SQL
Editor: ele atualiza a lista de tipos aceitos sem tocar nas fotos já enviadas.

**Situação.** *Disponível*, *Reservado* e *Vendido*. Um carro vendido continua
no site com o preço riscado, sai do sitemap e recebe `noindex` — o link que
alguém já tem continua funcionando, mas ele para de competir na busca.

**Preço em branco** vira "Sob consulta" no site. Nunca é preenchido sozinho.

**Segurança.** Nenhuma escrita acontece pelo navegador. O formulário chama uma
Server Action, que revalida a sessão e só então usa a chave `service_role` —
que nunca sai do servidor. As tabelas têm RLS com permissão pública apenas de
leitura. Excluir um veículo apaga também as fotos no Storage, para o bucket não
encher de arquivo órfão.

**Publicação imediata.** Toda gravação revalida `/`, `/estoque`, a página do
veículo e o `sitemap.xml`, então o site reflete a mudança sem esperar cache.

---

## Decisões que valem conhecer

**Nada de simulador de financiamento.** Taxa, prazo e aprovação dependem do banco
e do perfil do comprador. A página `/financiamento` capta a intenção e a equipe
faz a simulação real. Não há promessa de aprovação, taxa ou prazo em lugar nenhum
do site.

**Formulários entregam no WhatsApp.** Sem CRM ainda, os três formulários validam
os campos e abrem a conversa já escrita com tudo que a pessoa preencheu. É um
destino real, não um botão que finge enviar. O ponto de integração para um
backend está documentado em `lib/lead.ts`.

**Todo link de WhatsApp diz de onde veio.** `lib/whatsapp.ts` monta cada mensagem.
Na página de um veículo, a conversa abre com marca, modelo, ano, preço e URL —
a equipe nunca recebe um "olá, gostaria de saber mais" sem contexto.

**Tour 360 fica escondido até existir panorama.** `components/sections/Showroom360.tsx`
não renderiza nada enquanto `media.showroomPanorama` for `null`. Não há 360 falso
feito com CSS. As instruções para ativar estão no próprio arquivo.

**Schema.org sai dos dados reais.** `lib/seo.ts` só emite `Offer` quando existe
preço, só lista imagens quando são fotos de verdade, e a nota 4,8 / 39 avaliações
vem de `siteConfig.rating`. Veículo vendido recebe `noindex` e fica fora do sitemap.

**A paleta saiu da própria marca.** Preto da logo, prata da lettering, laranja
do carro — nada foi escolhido por fora. O núcleo é uma escala de cinco pretos
separados por elevação, e `--color-brand` é a única cor do sistema: aparece nos
botões primários, no anel de foco, na linha que separa o hero do estoque e nos
estados de hover. Trocar esse token rebrandeia o site inteiro.

**Botões são pílulas, mídia é arredondada.** Círculo para ação, retângulo suave
para conteúdo — a forma ecoa os destaques circulares que a loja já usa no
Instagram. Tudo sai de `.btn` e dos tokens de raio em `app/globals.css`, então
mudar a forma do site inteiro é mudar um arquivo.

**Contraste verificado, não estimado.** Todos os pares de cor do sistema passam
no AA da WCAG para texto (4,5:1) e no mínimo de 3:1 para bordas de controle —
inclusive `--color-control`, que existe justamente para separar o limite de um
campo de formulário das linhas puramente decorativas.

---

## Estrutura

```
app/(site)/             site público
app/(admin)/admin/      painel de cadastro
supabase/schema.sql     esquema do banco, para rodar uma vez
components/admin/       tabela, formulário, gerenciador de fotos
components/layout/      header, menu mobile, footer, WhatsApp flutuante
components/sections/    seções da home e institucionais
components/vehicle/     card, grade, filtros, galeria, ficha, CTAs
components/forms/       campos, financiamento, venda, contato
components/motion/      Reveal, MediaReveal, CountUp
components/ui/          Container, Button, ícones, links, JSON-LD
lib/                    site (NAP), repositório, SEO, WhatsApp, formatação
lib/admin/              auth, validação, server actions, consultas do painel
lib/supabase/           clientes público, de sessão e de service role
data/                   estoque de demonstração
types/                  modelo do veículo
```

Server Components por padrão. `"use client"` só onde existe interação:
filtros, galeria, carrosséis, formulários, menu e motion.
