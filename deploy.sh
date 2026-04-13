#!/bin/bash

# 部署脚本：停止Docker服务 -> 拉取最新代码 -> 重新构建并启动

set -e  # 遇到错误立即退出

echo "========================================="
echo "  开始部署 anime-admin"
echo "========================================="

# 1. 停止Docker服务
echo ""
echo "[1/3] 停止 Docker 服务..."
docker compose down
echo "✓ Docker 服务已停止"

# 2. 拉取最新代码
echo ""
echo "[2/3] 拉取最新代码..."
git pull origin master
echo "✓ 代码已更新"

# 3. 重新构建并启动
echo ""
echo "[3/3] 重新构建并启动 Docker 服务..."
docker compose up -d --build
echo "✓ Docker 服务已启动"

# 4. 查看服务状态
echo ""
echo "检查服务状态..."
docker compose ps

echo ""
echo "========================================="
echo "  ✓ 部署完成！"
echo "========================================="
echo ""
echo "访问地址: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "查看日志: docker compose logs -f"
echo ""
