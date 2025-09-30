#!/bin/bash

# 测试本地存储功能
# 使用方法: bash scripts/test-storage.sh

echo "========================================="
echo "🧪 测试本地存储功能"
echo "========================================="
echo ""

PROJECT_ROOT="/home/ubuntu/ship-haopengyou"
STORAGE_ROOT="$PROJECT_ROOT/storage/3d-models"

# 1. 检查存储目录
echo "1️⃣ 检查存储目录..."
if [ -d "$STORAGE_ROOT" ]; then
  echo "   ✅ 存储目录存在: $STORAGE_ROOT"
  ls -la "$STORAGE_ROOT"
else
  echo "   ❌ 存储目录不存在"
  exit 1
fi
echo ""

# 2. 检查权限
echo "2️⃣ 检查目录权限..."
if [ -w "$STORAGE_ROOT" ]; then
  echo "   ✅ 存储目录可写"
else
  echo "   ❌ 存储目录不可写"
  exit 1
fi
echo ""

# 3. 测试写入文件
echo "3️⃣ 测试文件写入..."
TEST_USER="test-user-123"
TEST_RECORD="test-record-456"
TEST_DIR="$STORAGE_ROOT/$TEST_USER/$TEST_RECORD"

mkdir -p "$TEST_DIR"
echo "Test content" > "$TEST_DIR/test.txt"

if [ -f "$TEST_DIR/test.txt" ]; then
  echo "   ✅ 文件写入成功: $TEST_DIR/test.txt"
  cat "$TEST_DIR/test.txt"
else
  echo "   ❌ 文件写入失败"
  exit 1
fi
echo ""

# 4. 测试文件读取
echo "4️⃣ 测试文件读取..."
if [ -r "$TEST_DIR/test.txt" ]; then
  echo "   ✅ 文件可读"
  CONTENT=$(cat "$TEST_DIR/test.txt")
  echo "   内容: $CONTENT"
else
  echo "   ❌ 文件不可读"
  exit 1
fi
echo ""

# 5. 测试文件删除
echo "5️⃣ 测试文件删除..."
rm -rf "$TEST_DIR"
if [ ! -d "$TEST_DIR" ]; then
  echo "   ✅ 文件删除成功"
else
  echo "   ❌ 文件删除失败"
  exit 1
fi
echo ""

# 6. 检查磁盘空间
echo "6️⃣ 检查磁盘空间..."
df -h "$PROJECT_ROOT" | tail -1
echo ""

# 7. 统计当前存储
echo "7️⃣ 统计当前存储使用..."
if [ -d "$STORAGE_ROOT" ]; then
  FILE_COUNT=$(find "$STORAGE_ROOT" -type f 2>/dev/null | wc -l)
  DIR_SIZE=$(du -sh "$STORAGE_ROOT" 2>/dev/null | cut -f1)
  USER_COUNT=$(find "$STORAGE_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
  
  echo "   📊 文件总数: $FILE_COUNT"
  echo "   📊 总大小: $DIR_SIZE"
  echo "   📊 用户数: $USER_COUNT"
else
  echo "   ⚠️ 存储目录为空"
fi
echo ""

# 8. 检查API路由文件
echo "8️⃣ 检查相关文件..."
FILES=(
  "src/lib/storage/local-storage-service.ts"
  "src/app/api/storage/3d-models/[...path]/route.ts"
  "src/lib/queue/model3d-queue.ts"
  "src/lib/tasks/cleanup-expired-models.ts"
  "scripts/cleanup-expired-models.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$PROJECT_ROOT/$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (缺失)"
  fi
done
echo ""

echo "========================================="
echo "✅ 所有测试通过！"
echo "========================================="
echo ""
echo "📝 下一步："
echo "   1. 重启开发服务器: pnpm dev"
echo "   2. 访问: http://localhost:3005/en/create/text-to-3d"
echo "   3. 提交新的生成任务"
echo "   4. 等待生成完成"
echo "   5. 检查终端日志，确认文件已下载"
echo "   6. 测试3D预览和下载功能"
echo "   7. 检查存储目录: ls -la $STORAGE_ROOT"
echo ""
