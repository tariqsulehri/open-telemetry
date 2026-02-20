# -----------------------------
# 1️⃣ Builder Stage
# -----------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@11.10.1

RUN npm ci --omit=dev

# -----------------------------
# 2️⃣ Runtime Stage
# -----------------------------
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

RUN useradd -m appuser
USER appuser

ENV NODE_ENV=production

EXPOSE 3500

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "index.js"]