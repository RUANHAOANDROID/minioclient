# 前端构建阶段
FROM node:22.14-alpine AS build_web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 后端构建阶段
FROM golang:1.23-alpine3.20 AS builder_go
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
COPY --from=build_web /app/frontend/dist /app/frontend/dist
RUN go build -ldflags="-s -w" -o runner

# 最终运行镜像
FROM alpine:3.20 AS runner
WORKDIR /app
COPY --from=builder_go /app/runner .
COPY --from=builder_go /app/config.yml .
CMD ["./runner"]
EXPOSE 80/tcp