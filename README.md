# Multistream

Aplicativo web para assistir múltiplas lives ao mesmo tempo nas plataformas Twitch e Kick. Permite adicionar canais por nome ou URL, organizar por drag and drop, definir número de colunas, mutar/desmutar globalmente e compartilhar o layout via link com parâmetros na URL.

## Visão Geral
- Stack: React + Vite + Tailwind CSS + Radix UI.
- Suporte a Twitch e Kick via players embutidos.
- Reordenação por arrastar e soltar das janelas.
- Controle de colunas (1–4) e mute global.
- Link de compartilhamento mantém sua configuração atual.

## Como Usar
- Campo “Plataforma”: selecione Twitch ou Kick.
- Campo “canal”: informe o slug do canal (ex.: `xqc`) ou cole a URL do canal (ex.: `https://twitch.tv/xqc`).
- Clique em “Adicionar” ou tecle Enter para inserir o canal.
- Arraste as janelas para reordenar. Use o seletor de colunas e o botão de mute global conforme necessário.
- Clique em “Copiar link” para compartilhar o layout atual.

## Parâmetros de URL
A página mantém o estado no URL para facilitar compartilhamento.
- `streams`: lista ordenada separada por vírgulas. Cada item é `t:<canal>` (Twitch) ou `k:<canal>` (Kick). Ex.: `?streams=t:xqc,k:trainwreckstv`.
- `cols`: número de colunas (1–4). Padrão: `2`. Ex.: `?cols=3`.
- `muted`: flag presente significa mudo global. Ex.: `?muted`.
- Compatibilidade: também aceita `twitch=<a,b>` e `kick=<c,d>`, mas ao atualizar o estado a app passa a usar apenas `streams`.

## Desenvolvimento
Pré‑requisitos
- Node.js LTS (18+) e npm.

Scripts
- `npm run dev`: inicia o Vite em modo dev (porta 5174).
- `npm run build`: build de produção para `dist/`.
- `npm run preview`: serve o build localmente.
- `npm run lint` / `npm run format`: checagem e formatação com Biome.

Alias e CSS
- Alias `@` aponta para `src/` (veja `vite.config.ts`).
- Tailwind CSS v4 configurado (veja `index.css`, `src/` e `@tailwindcss/vite`).

## Build e Deploy
Build estático
- `npm ci && npm run build` gera a pasta `dist/` pronta para servir como site estático.
- Consulte também `static-deploy.md` para dicas de deploy estático.

Docker
- Imagem multi‑stage: build com Node e serving com Nginx (veja `Dockerfile`).
- Subir com Docker Compose: `docker compose up --build` e acesse `http://localhost:5174`.
- Alternativa: `docker build -t multistream:local .` e `docker run -p 5174:80 multistream:local`.

## Dicas e Limitações
- Twitch exige o parâmetro `parent` com o domínio onde o embed carrega; o app usa automaticamente `window.location.hostname`. Garanta que o domínio de deploy seja o domínio final de acesso.
- Para Kick, o slug de canal é tratado em minúsculas.
- O botão “Resetar layout” limpa canais, colunas, mute e parâmetros da URL.

## Estrutura (resumo)
- `src/App.tsx`: UI principal, gerenciamento de layout e URL params.
- `src/components/TwitchPlayer.tsx`: integração com player da Twitch.
- `src/components/KickPlayer.tsx`: integração com player da Kick.
- `vite.config.ts`: plugins, aliases e Tailwind.
- `docker-compose.yml`, `Dockerfile`, `nginx.conf`: opções de deploy via Docker/Nginx.

---
Sinta‑se à vontade para sugerir melhorias ou abrir issues.
