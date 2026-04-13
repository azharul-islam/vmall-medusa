# ==========================================
# STAGE 1: The Builder
# ==========================================
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for the Admin UI)
# Using 'ci' instead of 'install' ensures exact versions from package-lock.json
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Medusa backend and the Admin dashboard
RUN npm run build


# ==========================================
# STAGE 2: The Production Runner
# ==========================================
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Set Node environment to production for framework optimizations
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies to keep the image small and secure
RUN npm ci --omit=dev

# Copy the compiled backend files from the builder stage
COPY --from=builder /app/.medusa ./.medusa

# Copy the compiled Admin dashboard files (Medusa outputs this to 'build')
# Using an asterisk prevents Docker from crashing if you ever disable the admin UI
COPY --from=builder /app/build* ./build

# Copy the Medusa configuration files (required at runtime)
COPY --from=builder /app/medusa-config.* ./

# ==========================================
# Security & Execution
# ==========================================

# Switch to the restricted 'node' user instead of running as root
RUN chown -R node:node /app
USER node

# Expose the standard Medusa port
EXPOSE 9000

# Run database migrations and boot the server
CMD ["sh", "-c", "npx medusa db:migrate && npm run start"]