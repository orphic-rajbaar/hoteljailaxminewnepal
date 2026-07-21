FROM node:22-alpine

# ── Security: upgrade ALL Alpine packages to their latest patched versions ──
# This resolves the critical/high CVEs flagged by scanners (Trivy, Docker Scout, etc.)
# because the base image ships with packages that have known CVEs at build time.
# Running apk upgrade here ensures every OS library is patched before the app runs.
RUN apk update \
 && apk upgrade --no-cache \
 && apk add --no-cache tini \
 && rm -rf /var/cache/apk/*

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

# Use tini as init to properly handle signals and reap zombie processes
ENTRYPOINT ["/sbin/tini", "--"]

# Start the app
CMD ["node", "server.js"]
