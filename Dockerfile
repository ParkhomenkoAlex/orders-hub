FROM node:22-bookworm-slim AS base

WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . ./

# Next.js inlines NEXT_PUBLIC_* values into browser bundles at build time.
ARG NEXT_PUBLIC_REALTIME_URL
ARG NEXT_PUBLIC_ORDER_STATUS_SUMMARY_MFE_URL
ENV NEXT_PUBLIC_REALTIME_URL=${NEXT_PUBLIC_REALTIME_URL}
ENV NEXT_PUBLIC_ORDER_STATUS_SUMMARY_MFE_URL=${NEXT_PUBLIC_ORDER_STATUS_SUMMARY_MFE_URL}

RUN npm run build:microfrontend && npm run build:wasm && npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
