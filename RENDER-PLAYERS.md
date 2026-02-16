## Flexbox vs Grid

Como o `useGridLayout` já calcula `cols`, qualquer um funciona. Mas **CSS Grid** é mais natural:

```tsx
<div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
```

Com flexbox você teria que calcular larguras manualmente com `flex-basis`. Grid faz isso nativamente.

## Re-renderização (a parte crítica)

Se os players são iframes (embeds de Twitch/YouTube/etc.), um re-render do componente **recarrega o iframe inteiro** — o stream reinicia. Para evitar isso, 3 técnicas combinadas:

### 1. Keys estáveis (obrigatório)

Usar o ID único do stream como `key`, **nunca** o index do array:

```tsx
// ERRADO - reordear causa unmount/remount de todos
{streams.map((s, i) => <Player key={i} />)}

// CERTO - React sabe que é o mesmo elemento, só move no DOM
{streams.map(s => <Player key={s.id} />)}
```

### 2. React.memo no Player (obrigatório)

Evita re-render quando o pai re-renderiza mas as props do player não mudaram:

```tsx
const Player = memo(({ streamId, width, height }) => {
  return <iframe ... />
})
```

### 3. Reordenação via CSS `order` (opcional, mais avançado)

Em vez de mudar a ordem no array (o que muda a posição no DOM), manter a ordem fixa no array e usar `style={{ order: posição }}` para reposicionar visualmente. Assim o React **não toca no DOM** ao reordenar — só muda um atributo CSS.

```tsx
{streams.map(s => (
  <Player key={s.id} style={{ order: s.position }} />
))}
```

---

**Resumo:** CSS Grid para layout + keys por ID + `memo` no Player. Com isso, adicionar/remover um stream só monta/desmonta aquele player específico, os outros ficam intocados.
