FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm with proper configuration and make shell scripts executable
RUN apk add --no-cache libc6-compat python3 make g++ && \
    npm config set prefix "/usr/local" && \
    npm install -g pnpm

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install -g pnpm && \
    pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Set the correct permission for prerender cache
RUN mkdir -p .next && \
    chown nextjs:nodejs .next

# Copy .next directory with proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# For standalone output
RUN if [ -d "/app/.next/standalone" ]; then \
      cp -r /app/.next/standalone/* /app/ && \
      cp -r /app/.next/static /app/.next/ ; \
    fi

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
