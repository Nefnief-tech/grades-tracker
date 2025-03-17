FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm with proper configuration
RUN npm config set prefix "/root/.npm" && \
    npm install -g pnpm && \
    export PATH="/root/.npm/bin:$PATH"

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN PATH="/root/.npm/bin:$PATH" pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm and build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm config set prefix "/root/.npm" && \
    npm install -g pnpm && \
    export PATH="/root/.npm/bin:$PATH" && \
    PATH="/root/.npm/bin:$PATH" pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy .next directory with proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# For standalone output
COPY --from=builder /app/next.config.js ./
RUN if [ -d "/app/.next/standalone" ]; then \
      cp -r /app/.next/standalone/* /app/ && \
      cp -r /app/.next/static /app/.next/ ; \
    fi

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
