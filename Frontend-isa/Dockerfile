# Frontend Vue.js - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Create .env file for production build
RUN echo "VITE_API_URL=https://api.isa-ambato.mg" > .env
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -q -O- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
