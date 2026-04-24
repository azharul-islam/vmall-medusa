FROM node:20-alpine

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Throttle C++ compilers to protect Hetzner RAM
ENV JOBS=2
ENV MAKEFLAGS="-j 2"

# 3. Install ALL dependencies 
RUN npm ci --no-audit --no-fund

# 4. Copy all source code
COPY . .

# 5. Build the Medusa app and Admin UI safely 
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# THE BUG FIX: Manually copy the Admin UI to where the server expects it
RUN cp -r .medusa/server/public /app/public

# 6. NOW set environment to production for runtime
ENV NODE_ENV=production

# 7. Security & Execution
RUN chown -R node:node /app
USER node

EXPOSE 9000

# Run migrations and start the server
CMD ["sh", "-c", "npx medusa db:migrate --execute-all-links && npm run start"]