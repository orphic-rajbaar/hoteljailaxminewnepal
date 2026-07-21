# Hotel Jai Laxmi & Lodge - Docker Configuration
# Node.js 18 Alpine (lightweight)

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker caching)
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy all app files
COPY . .

# Create data directory for db.json persistence
RUN mkdir -p /app/data

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the app
CMD ["node", "server.js"]
