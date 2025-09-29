#!/bin/bash

echo "🚀 启动腾讯混元3D功能"
echo "================================"

# 检查环境变量
if [ -z "$TENCENT_SECRET_ID" ]; then
    echo "⚠️  警告: 腾讯云密钥未配置"
    echo "请在 .env 文件中配置以下变量:"
    echo "  TENCENT_SECRET_ID"
    echo "  TENCENT_SECRET_KEY"
fi

echo ""
echo "📋 功能清单:"
echo "  ✅ 文本生成3D模型"
echo "  ✅ 图片生成3D模型"
echo "  ✅ 支持极速版、基础版、专业版"
echo "  ✅ 3D模型预览(Three.js)"
echo "  ✅ AR预览功能"
echo "  ✅ 智能队列管理"
echo "  ✅ 积分计费系统"
echo ""

echo "💳 积分消耗说明:"
echo "  • 极速版: 10积分(+5 PBR)"
echo "  • 专业版: 15-55积分不等"
echo "  • 基础版: 传统计费"
echo ""

echo "🌐 访问地址:"
echo "  http://localhost:3005/create/text-to-3d"
echo ""

echo "正在启动开发服务器..."
pnpm dev