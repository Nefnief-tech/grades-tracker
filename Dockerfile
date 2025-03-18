# Multi-architecture build stage
FROM --platform=$BUILDPLATFORM node:23-alpine AS builder

# Set target architecture explicitly
ARG TARGETARCH
ARG BUILDPLATFORM

WORKDIR /app

# Install build essentials
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Skip TypeScript checks and build with Next.js strict mode disabled
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_STRICT_MODE=false
ENV NEXT_TYPECHECK=false
RUN pnpm build

# Production stage
FROM --platform=$TARGETPLATFORM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV ARCH=arm64

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and production dependencies only
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
