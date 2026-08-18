# Deep-dive: por que os slots do grid precisam ser compactados

Referência de código: [`src/hooks/use-load-streams.ts`](../../src/hooks/use-load-streams.ts),
[`src/store/grid.ts`](../../src/store/grid.ts).

## O problema

O grid do multistream tem duas fontes de verdade que precisam ficar sincronizadas, mas que
vivem em lugares diferentes por design:

- **Quais streams estão ativas** — vem da URL (`?streams=twitch:canal,kick:canal2`). É por
  isso que dá pra copiar o link e mandar pra alguém com a mesma configuração.
- **Em qual slot cada stream aparece** (`slotOrder`) — vem do `localStorage`, via
  `useGridStore` (`zustand/persist`). É o que permite arrastar um player pra outra posição e
  essa posição sobreviver a um reload, sem precisar poluir a URL com índices.

O hook que concilia as duas, [`useLoadStreams`](../../src/hooks/use-load-streams.ts), roda toda
vez que a lista de streams da URL muda, e precisa responder três perguntas:

1. Uma stream que estava no `slotOrder` não existe mais na URL (foi removida) — o que fazer
   com o slot dela?
2. Uma stream nova apareceu na URL e não está em nenhum slot — em qual posição ela entra?
3. O que sobra no meio disso tudo deve ou não deixar buracos no grid?

## O experimento que expôs o comportamento

Antes de mexer no código, valeu reproduzir o cenário manualmente pra entender o que o hook
*realmente* fazia (não o que parecia que fazia lendo por cima). Com um grid 3×3, identificando
os slots como

```
A B C
D E F
G H I
```

o estado inicial era:

```
1 1 1
1 1 0
0 0 0
```

(A, B, C, D, E ocupados). Ao remover D:

```
1 1 1
0 1 0
0 0 0
```

E, ao adicionar duas streams novas em seguida, o resultado foi:

```
1 1 1
0 1 1
0 1 0
```

F e H foram preenchidos — não G (a posição "seguinte" mais óbvia visualmente) e não em ordem
sequencial a partir do último slot ocupado. Isso levantou duas perguntas:

1. Quando D foi removido, por que o que estava em E não "escorregou" pra D?
2. Por que as duas novas streams não seguiram uma ordem previsível (ex.: primeiro slot livre em
   leitura da esquerda pra direita, de cima pra baixo — que teria sido D, depois G)?

## Causa raiz

A resposta pra (2) está na própria lógica do hook: remoção não desloca nada, só marca a posição
como `null`. Inserção de stream nova varre o array **em ordem de índice** procurando o primeiro
`null` (`next.indexOf(null)`) — então, no exemplo, o buraco em D (índice 3) devia ser o
primeiro a ser reaproveitado. F e H aparecerem em vez de D e G só faz sentido se o array
`slotOrder`, internamente, não estava na ordem "visual" A-B-C-D-E-F-G-H-I que a leitura da
grade sugere — ou seja, o índice do array não é garantidamente igual à posição de leitura
humana depois de swaps manuais de drag-and-drop. O comportamento *era* determinístico
(primeiro `null` do array, sempre), só não era o determinismo que a intuição visual esperava.

A resposta pra (1) é mais simples: a versão original do hook nunca compactava o array depois de
marcar posições como `null`. O commit antes do fix fazia só:

```ts
setOrder(next) // next pode ter nulls no meio, permanentemente
```

Ou seja, um buraco deixado por uma remoção não desaparecia sozinho — ele virava uma posição
"vazia" permanente no `slotOrder` persistido, coexistindo com o preenchimento de gaps por
`indexOf(null)` acontecendo só no momento da própria sincronização, não depois.

## A correção

O fix (commit `74599a9`, *"compact stream order by removing null gaps"*) foi de uma linha, mas
muda a garantia que o `slotOrder` oferece:

```ts
// Compacta: remove todos os buracos null, o grid nunca tem posição vazia no meio
const compacted = next.filter((id): id is string => id !== null)

setOrder(compacted)
```

Com isso, `slotOrder` persistido nunca tem `null` no meio — só contém IDs de streams realmente
ativas, na ordem em que devem aparecer. Slots vazios "visuais" (os quadrados vazios no fim do
grid, que servem de drop target pro drag-and-drop) deixam de ser um conceito armazenado e
passam a ser calculados sob demanda em [`src/routes/index.tsx`](../../src/routes/index.tsx), via
`paddedOrder`, que completa o array até `totalSlots` só na hora de renderizar:

```ts
const paddedOrder = Array.from(
  { length: totalSlots },
  (_, i) => slotOrder[i] ?? null
)
```

## Por que isso importa

O ponto sutil é que **o array continua preenchendo buracos por `indexOf(null)` antes de
compactar** — isso não mudou. O que mudou é o que persiste entre uma sincronização e outra: sem
compactação, um buraco de remoção virava um estado permanente que o array de preenchimento de
"novas streams" só conseguia reaproveitar coincidentemente, e ficava misturado com os slots
vazios "de exibição" (os de `totalSlots`) de um jeito que não dava pra distinguir um do outro só
olhando a tela. Depois do fix, existe só um tipo de vazio (o de exibição, calculado, nunca
guardado), e a ordem relativa das streams ativas em `slotOrder` é sempre a fonte de verdade —
sem heurística de "onde cabe" competindo com "o que já existe".

Isso também simplificou o raciocínio sobre o próprio drag-and-drop: como `slotOrder` nunca tem
`null` no meio, um `swap` (troca de posição ao soltar um player sobre outro) sempre opera sobre
índices que representam streams reais — a distinção entre "índice do array" e "posição visual
no grid" só existe no espaço já compactado, sem interferência de buracos residuais de remoções
anteriores.

## Trade-off que fica

A ordem de preenchimento de slot novo (primeiro `null` por índice do array, não por posição
visual) continua sendo a explicada acima — é determinística, mas não necessariamente intuitiva
visualmente depois de vários drags. É um comportamento aceitável (a alternativa, recalcular por
posição visual a cada mudança, adicionaria complexidade sem um ganho de UX claramente melhor
para o caso de uso), mas vale documentar que "aleatório" no relato inicial era, na verdade,
"determinístico sobre um índice que não é o que os olhos leem".
