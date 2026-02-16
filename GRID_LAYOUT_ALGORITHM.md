# Algoritmo do Grid Layout

Referência: `src/hooks/use-grid-layout.ts`

## Objetivo

Dado **N players** (16:9) e uma viewport de **W × H**, encontrar o grid (cols × rows) que maximize o tamanho de cada player.

## Passo a passo

### 1. Iterar todas as combinações possíveis de colunas

```
para cols de 1 até N:
    rows = ceil(N / cols)
```

Exemplo com N=5:
- cols=1, rows=5 → 1 coluna, 5 linhas
- cols=2, rows=3 → 2 colunas, 3 linhas (6 células, 1 vazia)
- cols=3, rows=2 → 3 colunas, 2 linhas (6 células, 1 vazia)
- cols=4, rows=2 → 4 colunas, 2 linhas (8 células, 3 vazias)
- cols=5, rows=1 → 5 colunas, 1 linha

### 2. Calcular o tamanho da célula no grid

Cada célula ocupa uma fração igual da viewport:

```
cellWidth  = W / cols
cellHeight = H / rows
```

Exemplo: viewport 1920×1080, cols=2, rows=2:
- cellWidth  = 1920 / 2 = 960
- cellHeight = 1080 / 2 = 540

### 3. Encaixar um player 16:9 dentro da célula

O player precisa caber na célula **sem estourar** nenhuma dimensão, mantendo 16:9.

A célula tem seu próprio aspect ratio: `cellWidth / cellHeight`.

Comparamos com 16/9 (≈1.778) para descobrir **qual dimensão é o gargalo**:

#### Caso A: célula mais larga que 16:9 (`cellWidth / cellHeight > 1.778`)

A célula é "mais larga" que o player precisa. Sobra espaço horizontal.
A **altura** é o limitante — usamos toda a altura da célula:

```
playerHeight = cellHeight
playerWidth  = cellHeight × (16/9)
```

Exemplo visual (célula 1200×500, ratio 2.4 > 1.778):
```
┌──────────────────────────┐
│    ┌────────────────┐    │  playerH = 500
│    │     PLAYER     │    │  playerW = 500 × 1.778 = 889
│    └────────────────┘    │
└──────────────────────────┘
      ← sobra lateral →
```

#### Caso B: célula mais alta que 16:9 (`cellWidth / cellHeight ≤ 1.778`)

A célula é "mais alta" que o player precisa. Sobra espaço vertical.
A **largura** é o limitante — usamos toda a largura da célula:

```
playerWidth  = cellWidth
playerHeight = cellWidth / (16/9)
```

Exemplo visual (célula 800×600, ratio 1.33 < 1.778):
```
┌────────────────┐
│                │  ← sobra em cima
│ ┌────────────┐ │
│ │   PLAYER   │ │  playerW = 800
│ └────────────┘ │  playerH = 800 / 1.778 = 450
│                │  ← sobra embaixo
└────────────────┘
```

### 4. Comparar todas as combinações e pegar a melhor

Para cada combinação calculamos a **área do player** (`playerWidth × playerHeight`).
O grid que resulta na maior área vence — porque significa o maior player possível.

### 5. Exemplo completo

Viewport: 1920×1080, N=3 players

| cols | rows | célula     | ratio | limitante | player    | área    |
|------|------|------------|-------|-----------|-----------|---------|
| 1    | 3    | 1920×360   | 5.33  | altura    | 640×360   | 230,400 |
| 2    | 2    | 960×540    | 1.78  | exato!    | 960×540   | 518,400 |
| 3    | 1    | 640×1080   | 0.59  | largura   | 640×360   | 230,400 |

**Vencedor: 2 colunas × 2 linhas** (1 célula vazia), cada player com 960×540.
