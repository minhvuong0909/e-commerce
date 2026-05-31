# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Copy root workspace configs và package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Copy mã nguồn frontend
COPY apps/web ./apps/web

WORKDIR /app/apps/web

# Định nghĩa các biến môi trường lúc build
ARG VITE_BASE_URL_API
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_BASE_URL_API=$VITE_BASE_URL_API
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build React/Vite app ra static files
RUN pnpm run build

# Stage 2: Serve static files với Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# Copy file config nginx phục vụ cho Single Page Application (SPA routing)
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
