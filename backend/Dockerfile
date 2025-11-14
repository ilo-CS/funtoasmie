FROM node:20-alpine

LABEL version="1.0.0"
LABEL description="Backend API pour le système de gestion FUNTOA SMIE"

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force


COPY . .

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]