# 前端构建阶段
FROM node:22-alpine AS build_web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 后端构建阶段
FROM golang:1.23-alpine3.20 AS build_go
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod tidy
COPY . .
COPY --from=build_web /app/frontend/dist /app/frontend/dist
RUN GOOS=linux go build -ldflags="-s -w" -o runner

# 最终运行镜像
FROM alpine:3.20 AS runner
WORKDIR /app
COPY --from=build_go /app/runner .
COPY --from=build_go /app/config.yml .
RUN apk add --no-cache dumb-init
CMD ["./runner"]
EXPOSE 80