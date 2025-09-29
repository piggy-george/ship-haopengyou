#!/bin/bash

echo "🔄 恢复生产环境代码..."
echo "================================"

# 1. 恢复前端页面的登录限制
echo "✅ 恢复前端登录限制..."
sed -i '16s/const REQUIRE_LOGIN = false;/const REQUIRE_LOGIN = true;/' src/app/\[locale\]/\(default\)/create/text-to-3d/page.tsx

# 2. 恢复后端API提交接口的登录限制
echo "✅ 恢复后端提交API登录限制..."
sed -i '11s/const REQUIRE_LOGIN = false;/const REQUIRE_LOGIN = true;/' src/app/api/ai/generate/text-to-3d/route.ts

# 3. 恢复后端API查询接口的登录限制
echo "✅ 恢复后端查询API登录限制..."
sed -i '9s/const REQUIRE_LOGIN = false;/const REQUIRE_LOGIN = true;/' src/app/api/ai/generate/text-to-3d/status/route.ts

echo ""
echo "⚠️  注意事项："
echo "1. 还需要手动删除 src/app/api/ai/generate/text-to-3d/route.ts 第59-73行的测试用户创建代码"
echo "2. 可选：清理数据库中的测试数据 (test@example.com 用户)"
echo ""
echo "✅ 代码恢复完成！"
echo ""
echo "建议检查以下文件确认修改："
echo "  - src/app/[locale]/(default)/create/text-to-3d/page.tsx (第16行)"
echo "  - src/app/api/ai/generate/text-to-3d/route.ts (第11行)"
echo "  - src/app/api/ai/generate/text-to-3d/status/route.ts (第9行)"