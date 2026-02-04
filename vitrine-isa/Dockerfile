# Vitrine Nuxt.js - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Set production API URL
ENV NUXT_PUBLIC_API_URL=https://api.isa-ambato.mg
RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]
