# Hotel Jai Laxmi & Lodge - Docker Configuration
# Node.js 22 Alpine (latest LTS — fewest known CVEs)

FROM node:22-alpine

# Install OS security patches on top of the base image
# This clears the remaining high/critical Alpine CVEs in one step
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

# Run as non-root user for security (principle of least privilege)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev && npm cache clean --force

# Copy all app files
COPY . .

# Create data directory and set correct ownership
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the app
CMD ["node", "server.js"]
