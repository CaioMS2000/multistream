# Stage 1: build estático com Node
FROM node:lts-alpine AS builder
WORKDIR /app

# Copia apenas manifests para aproveitar cache do npm ci
COPY package*.json ./

# Instala dependências (inclui devDependencies para vite/ts)
RUN npm ci

# Copia o restante do projeto e faz o build
COPY . .
RUN npm run build

# Stage 2: servidor estático mínimo (nginx)
FROM nginx:alpine AS runner

# Copia build para o diretório público do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração do nginx (inclui fallback opcional para SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Comando padrão do nginx (já definido na imagem base)
