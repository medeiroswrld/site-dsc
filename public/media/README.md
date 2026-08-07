# public/media

Vídeos da loja. Os arquivos abaixo ainda não existem — enquanto faltarem, o
hero da home mostra o poster placeholder e o elemento `<video>` se remove
sozinho, sem quebrar o layout.

| Arquivo | Especificação |
| --- | --- |
| `hero.mp4` | H.264 · ~1920×1080 · **sem faixa de áudio** · 12–25 s em loop · alvo de 3–6 MB |
| `hero.webm` | opcional · VP9 ou AV1 · mesmo corte, arquivo menor |
| `hero-poster.jpg` | primeiro quadro do vídeo · ~1920×1080 · comprimido |
| `showroom-360.jpg` | opcional · panorama equirretangular 2:1 do showroom |

Depois de adicionar os arquivos, ajuste `media` em `lib/site.ts`:

- `heroPoster` → `/media/hero-poster.jpg`
- `showroomPanorama` → `/media/showroom-360.jpg` (só então a seção 360 aparece)

O vídeo não deve ter áudio: ele toca automaticamente e em silêncio, e uma faixa
de áudio só aumentaria o arquivo.
