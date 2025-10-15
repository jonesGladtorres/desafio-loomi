# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY libs ./libs
COPY prisma ./prisma
COPY apps/clients ./apps/clients

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação clients
RUN npm run build:clients

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar apenas o necessário para produção
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Gerar Prisma Client novamente no ambiente de produção
RUN npx prisma generate

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "dist/apps/clients/main"]

