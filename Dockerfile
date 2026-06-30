FROM oven/bun:1.1-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun build ./src/app.ts --outdir ./dist --target node

FROM oven/bun:1.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN bun install --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["bun", "run", "src/app.ts"]
