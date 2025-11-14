FROM node:20-alpine AS builder

LABEL stage="build"

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY . .
RUN printf "REACT_APP_API_URL=%s\n" "${REACT_APP_API_URL}" > .env.production && \
    npm run build

FROM nginx:1.27-alpine AS production

LABEL version="1.0.0"
LABEL description="Frontend FUNTOA SMIE"

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

