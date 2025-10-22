# Dockerfile para Salon Booking - Microserviço completo
# Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer
# GitHub: https://github.com/miapferreira

# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS backend-builder

# Instala dependências do sistema
RUN apk add --no-cache curl

WORKDIR /app

# Copia e instala dependências do backend
COPY backend/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copia código do backend
COPY backend/ ./

# Stage 2: Imagem final
FROM node:18-alpine

# Metadados da imagem
LABEL maintainer="Michel Ferreira <mi.apferreira@gmail.com>"
LABEL description="Salon Booking - Sistema de agendamento para salão de beleza"
LABEL version="1.0.0"
LABEL repository="https://github.com/miapferreira/salon-booking"

# Instala dependências do sistema
RUN apk add --no-cache curl tini

WORKDIR /app

# Copia node_modules do stage anterior
COPY --from=backend-builder /app/node_modules ./node_modules

# Copia código do backend
COPY backend/ ./

# Copia frontend (será servido pelo backend)
COPY frontend/ ./public/

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expõe porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Usa tini como init system
ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]

