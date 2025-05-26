# 前端构建阶段
FROM node:22.14-alpine AS frontend
WORKDIR /app/frontend
# 先复制 package.json 和 package-lock.json（或 yarn.lock）安装依赖
COPY frontend/package*.json ./
RUN npm install
# 复制整个前端代码并构建
COPY frontend/ .
RUN npm run build

# 后端构建阶段
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
# 复制所有代码
COPY . .
COPY --from=frontend /app/frontend/dist /app/frontend/dist
# 编译 Go 二进制文件，假设入口文件在 cmd/main.go，可根据实际需求修改
RUN go build -ldflags="-s -w" -o  runner

# 最终运行镜像
FROM alpine:latest
WORKDIR /app
# 复制编译后的后端二进制
COPY --from=builder /app/app .
# 复制前端构建产物到指定路径（后端可通过此目录提供静态文件服务，也可根据实际情况调整）
COPY --from=frontend /app/frontend/build ./frontend/build
# 开放应用端口（例如 80）
EXPOSE 80
# 启动后端服务
ENTRYPOINT ["./app"]