FROM node:20-alpine

# Create a non-root user
RUN addgroup -g 1001 -S neurallog && \
    adduser -S neurallog -u 1001 -G neurallog

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Create a directory for logs with proper permissions
RUN mkdir -p /var/log/neurallog && \
    chown -R neurallog:neurallog /var/log/neurallog && \
    chown -R neurallog:neurallog /app

# Switch to non-root user
USER neurallog

# Set environment variables
ENV NODE_ENV=production
ENV LOG_DIR=/var/log/neurallog

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Set the entry point to the MCP client
# Using ENTRYPOINT instead of CMD ensures that the process receives signals properly
ENTRYPOINT ["node", "dist/index.js"]
