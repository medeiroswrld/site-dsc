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

O lockup já está no site. `components/layout/Wordmark.tsx` combina a lettering
"D.S.C / SEMINOVOS" na fonte do próprio site com o carro laranja em SVG inline
(`CarMark`), que também vira o ícone da aba em `app/icon.svg`.

**O carro foi redesenhado em vetor a partir da foto de perfil do Instagram.**
Ficou próximo, mas não é o arquivo original. Quando tiver o logo em alta — SVG
de preferência, ou PNG com fundo transparente — coloque em `public/brand/` e
troque o `<CarMark />` por um `<Image>`. As proporções já batem.

### 4. Estoque real

`data/vehicles.ts` contém **12 veículos fictícios**, marcados no topo do arquivo.
Enquanto `DEMO_DATA` for `true`, uma faixa avisa isso no topo de todas as páginas.

Para conectar o estoque real, mexa **só** em `lib/vehicles-repository.ts` — é o
único módulo que sabe de onde vêm os dados. As funções já são `async` e todos os
pontos de uso já usam `await`, então trocar o array por um CMS, Supabase ou API
de estoque não toca em nenhum componente.

### 5. Dados comerciais a confirmar

Em `lib/site.ts`:

- `url` — domínio de produção (usado em canonical, sitemap e schema).
- `whatsapp` — número do WhatsApp da loja. **Hoje está o fixo como provisório.**
- `googleReviewsUrl` — link do perfil real no Google Meu Negócio.
- `geo` — coordenadas exatas do pino no Maps.
- `hours` — confirmar os horários de atendimento.

Em `app/politica-de-privacidade/page.tsx`: razão social, CNPJ e e-mail para
solicitações de dados.

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
app/                    rotas (App Router)
components/layout/      header, menu mobile, footer, WhatsApp flutuante
components/sections/    seções da home e institucionais
components/vehicle/     card, grade, filtros, galeria, ficha, CTAs
components/forms/       campos, financiamento, venda, contato
components/motion/      Reveal, MediaReveal, CountUp
components/ui/          Container, Button, ícones, links, JSON-LD
lib/                    site (NAP), repositório, SEO, WhatsApp, formatação
data/                   estoque de demonstração
types/                  modelo do veículo
```

Server Components por padrão. `"use client"` só onde existe interação:
filtros, galeria, carrosséis, formulários, menu e motion.
