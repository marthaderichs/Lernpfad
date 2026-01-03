# Single stage build for simplicity
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (we need vite for build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Remove node_modules and reinstall production only
RUN rm -rf node_modules && npm install --omit=dev

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Start the server
CMD ["node", "server.js"]
