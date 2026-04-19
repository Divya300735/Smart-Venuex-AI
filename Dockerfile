# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies (--legacy-peer-deps handles React 19 conflicts)
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source and build
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Production Server ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ .

# Copy built frontend into backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Cloud Run uses PORT env var
ENV PORT=8080
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
