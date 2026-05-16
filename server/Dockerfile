# ==================================================
# Stage 1 — Builder
# ==================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# ==================================================
# Stage 2 — Production
# ==================================================
FROM node:20-alpine

WORKDIR /app

# Required for sharp
RUN apk add --no-cache \
    vips \
    libc6-compat

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads logs

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "dist/index.js"]