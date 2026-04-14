FROM node:20-alpine

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Throttle C++ compilers to protect Hetzner RAM
ENV JOBS=2
ENV MAKEFLAGS="-j 2"

# 3. Install ALL dependencies (keeps the TypeScript tools needed for the CLI)
RUN npm ci --no-audit --no-fund

# 4. Copy all source code
COPY . .

# 5. Set environment to production for framework optimizations
ENV NODE_ENV=production

# 6. Build the Medusa app and Admin UI safely
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 7. Security & Execution
RUN chown -R node:node /app
USER node

EXPOSE 9000
# Run migrations and start the server
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]