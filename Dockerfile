FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Instala solo dependencias de producción (capa cacheable)
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
# Copia el resto del código
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
