FROM node:20-alpine

WORKDIR /app

# Backend API + shared mail code
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/

# Worker process (BullMQ) — minimal deps; resolves bullmq from ./worker/node_modules
COPY worker/package.json worker/package-lock.json* ./worker/
RUN cd worker && npm ci --omit=dev

COPY worker/worker.js worker/register-env.js ./worker/

WORKDIR /app
CMD ["node", "worker/worker.js"]
