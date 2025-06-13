# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neurallog -u 1001

# Copy built application and dependencies
COPY --from=builder --chown=neurallog:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=neurallog:nodejs /app/dist ./dist
COPY --from=builder --chown=neurallog:nodejs /app/prisma ./prisma
COPY --from=builder --chown=neurallog:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown neurallog:nodejs logs

# Switch to non-root user
USER neurallog

# Expose port
EXPOSE 3050

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3050/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
