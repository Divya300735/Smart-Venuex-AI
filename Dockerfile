# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend/ .

# Build production bundle
RUN npm run build

# ─── Stage 2: Production Server ───────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ .

# Copy built frontend into backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Cloud Run provides PORT env var; default to 8080
ENV PORT=8080
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
