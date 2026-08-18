# multistream

Assista várias lives (Twitch/Kick) ao mesmo tempo, num grid ajustável, com posição de cada
player salva e a configuração inteira compartilhável por link.

## O problema

Ferramentas de multi-stream em geral ou fixam o layout, ou perdem a posição de cada player a
cada reload, ou não deixam compartilhar a tela montada com outra pessoa. O multistream resolve
os três ao mesmo tempo:

- **Quais streams estão na tela** vive na URL (`?streams=twitch:canal,kick:canal2`) — copiar o
  link e mandar pra alguém reproduz a mesma tela.
- **Em que posição cada player está** é salvo separadamente, no navegador — arrastar um player
  pra outro slot sobrevive a um reload sem precisar inchar a URL.
- **O grid se adapta à tela** — escolhendo o número de colunas, o layout calcula quantas linhas
  cabem mantendo proporção 16:9 em cada player.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # gera dist/
npm run preview    # serve o build localmente
```

Via Docker (build multi-stage + nginx servindo estático):

```bash
docker compose up --build   # http://localhost:5174
```

## Principais funcionalidades

- **Grid dinâmico por número de colunas** — define `cols` e o layout recalcula linhas, largura
  e altura de cada player mantendo 16:9, considerando o tamanho real da viewport
  ([`use-grid-layout.ts`](src/hooks/use-grid-layout.ts)).
- **Drag-and-drop entre slots** — arrastar um player sobre outro troca as posições (`dnd-kit`).
- **Ordem de slot persistente e independente da lista de streams** — a posição de cada player
  sobrevive a reload e é reconciliada com a lista de streams da URL sempre que uma stream é
  adicionada, removida ou trocada. É a parte mais delicada do projeto — ver o
  [deep-dive sobre compactação de slots](docs/deep-dives/compactacao-de-slots.md).
- **Configuração compartilhável por link** — streams, número de colunas e mute global ficam na
  query string.
- **Histórico de streams removidas**, com opção de reativar sem redigitar canal/plataforma.
- **Controles por player**: mute individual, troca de canal/plataforma inline, reload do embed.
- **Iframes não recarregam ao reordenar** — reordenar streams não desmonta os players
  (`React.memo` + `key` estável por `platform:channel` + CSS Grid, sem tocar a ordem no DOM —
  ver [RENDER-PLAYERS.md](RENDER-PLAYERS.md)).

## Arquitetura

Aplicação client-side pura (SPA), sem backend — build estático servido por nginx.

```
TanStack Router (estado principal via search params)
  └─ routes/index.tsx
       ├─ useGridLayout        → calcula cols/rows/tamanho do player a partir da viewport
       ├─ useLoadStreams       → sincroniza streams da URL com a ordem de slot persistida
       ├─ useGridStore (zustand+persist) → posição de cada stream no grid (localStorage)
       ├─ useHistoryStore (zustand+persist) → streams removidas (localStorage)
       └─ DndContext (dnd-kit) → swap de posição ao arrastar
            └─ Slot × N
                 └─ PlayerContainer (memo) → TwitchPlayer | KickPlayer (iframe)
```

Duas fontes de verdade coexistem de propósito: a URL decide **o quê** está na tela (pra ser
compartilhável), o `localStorage` decide **onde** cada coisa está (pra sobreviver a reload sem
poluir o link). A reconciliação entre as duas é o único ponto realmente não-trivial do projeto —
detalhado no deep-dive linkado acima.

## Stack

React 19 · TypeScript · Vite · TanStack Router · Zustand (+persist) · dnd-kit · Tailwind v4 ·
shadcn/radix-ui · react-hook-form + zod · Biome (lint/format) · Docker + nginx (deploy estático)

## Estrutura de pastas

```
src/
├── routes/           TanStack Router — rota única, orquestra grid + drag-and-drop
├── components/        UI: layout, slots, sidebar/histórico, top bar, players/
├── hooks/              use-grid-layout, use-load-streams, use-stream-manager, use-window-size
├── store/              zustand: streams (em memória), grid (slotOrder), history — os dois
│                       últimos persistidos em localStorage
├── utils/              parse-stream (parse/serialização do parâmetro `streams` da URL)
└── @types/             Stream, STREAM_OPTION
```

## Documentação adicional

- [GRID_LAYOUT_ALGORITHM.md](GRID_LAYOUT_ALGORITHM.md) — como cols/rows/tamanho do player são
  calculados a partir da viewport.
- [RENDER-PLAYERS.md](RENDER-PLAYERS.md) — por que reordenar streams não recarrega os iframes.
- [docs/deep-dives/compactacao-de-slots.md](docs/deep-dives/compactacao-de-slots.md) — como a
  ordem dos slots é reconciliada com a lista de streams da URL, e o bug de buracos residuais que
  isso escondia até ser corrigido.
