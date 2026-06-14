FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/widget/package.json ./apps/widget/
COPY packages/db/package.json ./packages/db/

RUN pnpm install --frozen-lockfile

# Build widget
FROM base AS widget-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/widget/node_modules ./apps/widget/node_modules
COPY . .
RUN pnpm --filter @freebase/widget build

# Build web app
FROM base AS web-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules || true
COPY . .
COPY --from=widget-builder /app/apps/widget/dist/sdk.js ./apps/web/public/cdn/v1/sdk.js

# Generate Prisma client
RUN pnpm db:generate

# Build Next.js — DOCKER_BUILD enables standalone output in next.config.ts
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
RUN pnpm --filter web build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built output
COPY --from=web-builder /app/apps/web/.next/standalone ./
COPY --from=web-builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-builder /app/apps/web/public ./apps/web/public
COPY --from=web-builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
