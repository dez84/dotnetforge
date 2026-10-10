# DotNetForge web — production image (Next.js standalone)
# Build context must be the repository root:  docker build -f frontend/Dockerfile .

# --- build stage -------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

# Workspace manifests (lockfile references both workspaces, so both must exist).
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci && npm cache clean --force

COPY frontend ./frontend

# Baked into the Next rewrite at build time — points the /api proxy at the API.
ARG API_PROXY_TARGET=http://backend:4000
ENV API_PROXY_TARGET=$API_PROXY_TARGET
# Container builds need the self-contained server bundle.
ENV BUILD_STANDALONE=1
RUN npm --workspace frontend run build

# --- runtime stage -----------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The standalone bundle already contains its required node_modules.
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# Ensure the non-root runtime user can read everything.
RUN chmod -R a+rX /app

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "frontend/server.js"]
