# ==========================================
# STAGE 1: The Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# THE FIX: Force native C++ compilers to use only 1 CPU core
ENV JOBS=1
RUN npm ci
COPY . .
# THE FIX: Hard-cap Node.js memory usage to 4GB so it cannot trigger the OOM killer
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ==========================================
# STAGE 2: The Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# THE FIX: Copy the package files FROM the builder stage instead of the local machine.
# This forces Docker BuildKit to wait for Stage 1 to completely finish before starting Stage 2.
COPY --from=builder /app/package*.json ./

# Now this will run safely on its own, avoiding the memory spike
RUN npm ci --omit=dev

COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/build* ./build
COPY --from=builder /app/medusa-config.* ./

# ==========================================
# Security & Execution
# ==========================================
RUN chown -R node:node /app
USER node
EXPOSE 9000
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]