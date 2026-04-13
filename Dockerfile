# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 生产阶段 - 使用node静态服务，不需要nginx
FROM node:18-alpine

# 安装serve用于静态文件服务
RUN npm install -g serve

# 复制构建产物
COPY --from=builder /app/dist /app/dist

# 暴露端口
EXPOSE 3001

# 启动静态文件服务
CMD ["serve", "-s", "dist", "-l", "3001"]
