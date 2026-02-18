# Algoritmo do Grid Layout

Referência: `src/hooks/use-grid-layout.ts`

## Objetivo

Dado um número de **colunas** desejado e uma viewport de **W × H**, calcular quantos slots 16:9 cabem na tela e qual o tamanho de cada um.

## Passo a passo

### 1. Calcular a largura do player

Dividimos a largura da viewport pelo número de colunas:

```
playerWidth = floor(W / cols)
```

Exemplo: viewport 1920×1080, cols=2:
- playerWidth = floor(1920 / 2) = 960

### 2. Calcular a altura do player (respeitando 16:9)

A altura é derivada da largura para manter a proporção:

```
playerHeight = floor(playerWidth / (16/9))
```

Exemplo:
- playerHeight = floor(960 / 1.778) = 540

### 3. Calcular quantas linhas cabem

Dividimos a altura da viewport pela altura do player:

```
rows = floor(H / playerHeight)
```

Exemplo:
- rows = floor(1080 / 540) = 2

### 4. Calcular o total de slots

```
totalSlots = cols × rows
```

Exemplo:
- totalSlots = 2 × 2 = 4

## Exemplos

Viewport: 1920×1080

| cols | playerWidth | playerHeight | rows | totalSlots |
|------|-------------|--------------|------|------------|
| 1    | 1920        | 1080         | 1    | 1          |
| 2    | 960         | 540          | 2    | 4          |
| 3    | 640         | 360          | 3    | 9          |
| 4    | 480         | 270          | 4    | 16         |

## Conceito de slots

Os slots são posições fixas no grid. Cada slot pode:
- Estar **vazio** (drop target para arrastar um player)
- Conter um **player** (que pode ser arrastado para outro slot)

Arrastar um player sobre outro **troca suas posições** (swap).
