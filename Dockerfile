# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PORT=1800 \
    HOST=0.0.0.0

WORKDIR /app

# Install only production dependencies and keep the image small.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Run as the non-root Node user.
USER node

EXPOSE 1800

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:1800/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
