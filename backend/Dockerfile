# DotNetForge API — production image
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies first (better layer caching).
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev && npm cache clean --force

# Application source.
COPY backend/src ./backend/src

# Ensure the non-root runtime user can read everything, regardless of the
# permissions the build context came with.
RUN chmod -R a+rX /app/backend

WORKDIR /app/backend
EXPOSE 4000

# Run as the non-root user that ships with the node image.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
