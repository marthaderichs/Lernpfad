# Build stage - verwendet für Production Build
FROM node:20-alpine AS builder

WORKDIR /app

# WICHTIG: Python und Build-Tools für native Module (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for vite build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage - schlankes Image
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for healthcheck AND build tools for native modules
RUN apk add --no-cache wget python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies (now includes tsx!)
RUN npm ci --omit=dev

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server file
COPY server.js ./

# Copy server directory with TypeScript files
COPY server/ ./server/

# Copy tsconfig for tsx
COPY tsconfig.json ./

# Create data directory with correct permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server (with migration using tsx for TypeScript)
# tsx is needed because server.js imports from ./server/db/*.ts
CMD ["sh", "-c", "npx tsx server/db/migrate-from-json.ts && npx tsx server.js"]
