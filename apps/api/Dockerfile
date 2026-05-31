# Stage 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Copy root workspace configs và package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Cài đặt dependencies cho workspace
RUN pnpm install --frozen-lockfile

# Copy mã nguồn của backend
COPY apps/api ./apps/api

# Build Backend TypeScript sang JavaScript
WORKDIR /app/apps/api
RUN pnpm run build

# Stage 2: Runner stage (production)
FROM node:22-alpine AS runner
WORKDIR /app

# Thiết lập NODE_ENV=production để tối ưu hiệu suất
ENV NODE_ENV=production

# Copy built code từ stage 1
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api

# Tạo thư mục uploads và tmp cho media
RUN mkdir -p uploads tmp

# Expose port
EXPOSE 3000

# Khởi chạy server backend
CMD ["node", "dist/index.js", "--production"]
