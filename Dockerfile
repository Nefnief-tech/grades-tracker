FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the app
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
