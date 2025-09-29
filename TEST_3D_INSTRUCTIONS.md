# 腾讯混元3D API 测试说明

## 🔧 当前测试模式配置

当前已**临时禁用登录限制**，方便测试API对接功能。

### 测试开关位置：
1. **前端页面**: `/src/app/[locale]/(default)/create/text-to-3d/page.tsx`
   - 变量: `REQUIRE_LOGIN = false`

2. **后端API**:
   - `/src/app/api/ai/generate/text-to-3d/route.ts`
   - `/src/app/api/ai/generate/text-to-3d/status/route.ts`
   - 变量: `REQUIRE_LOGIN = false`

### 测试用户配置：
- 测试邮箱: `test@example.com`
- 测试积分: 10000
- 自动创建测试用户（如果不存在）

## 🚀 测试步骤

### 1. 启动项目
```bash
pnpm dev
```
项目将在 http://localhost:3005 启动

### 2. 访问3D生成页面
```
http://localhost:3005/create/text-to-3d
```

### 3. 测试功能

#### A. 文生3D测试
1. 切换到"文生3D"标签
2. 输入文本描述，例如：
   - "一只可爱的小猫"
   - "红色的苹果"
   - "卡通风格的汽车"
3. 选择版本：
   - **极速版** (10积分) - 快速测试
   - **专业版** (15-55积分) - 高质量
   - **基础版** - 传统计费
4. 点击"生成3D模型"

#### B. 图生3D测试

**单张图片模式：**
1. 切换到"图生3D"标签
2. 选择"单张图片"
3. 点击上传区域，选择一张图片（JPG/PNG/WEBP，<8MB）
4. 选择版本和参数
5. 点击"生成3D模型"

**多视图模式（四宫格）：**
1. 切换到"多视图(2-4张)"
2. 分别上传2-4张不同角度的图片：
   - 正面/主视图
   - 左侧视图
   - 右侧视图
   - 背面/后视图
3. 选择版本和参数
4. 点击"生成3D模型"

### 4. 检查点

#### ✅ API连接测试
- [ ] 腾讯云密钥配置正确
- [ ] 能成功提交任务
- [ ] 返回JobId

#### ✅ 队列系统测试
- [ ] 显示排队状态
- [ ] 显示预计等待时间
- [ ] 状态更新（waiting → processing → completed）

#### ✅ 积分系统测试
- [ ] 正确计算积分消耗
- [ ] 积分扣除成功
- [ ] 失败时积分退还

#### ✅ 结果展示测试
- [ ] 生成完成后显示下载链接
- [ ] 支持多种格式（GLB/OBJ/STL等）
- [ ] 文件可以正常下载

## 📊 监控日志

### 前端控制台
查看浏览器开发者工具的Console，观察：
- API请求和响应
- 轮询状态更新
- 错误信息

### 后端日志
在终端查看服务器日志：
- 腾讯云API调用日志
- 队列处理日志
- 错误堆栈信息

## 🔍 常见问题

### 1. API连接失败
- 检查环境变量 `.env` 中的腾讯云密钥
- 确认密钥有混元3D服务权限

### 2. 任务一直在排队
- 检查队列管理器是否正常运行
- 查看后端日志是否有错误

### 3. 生成失败
- 检查图片格式和大小是否符合要求
- 查看错误信息了解具体原因

## ⚠️ 测试完成后的操作（重要！）

测试完成后，需要**恢复以下临时代码**：

### 1. 前端页面 - `/src/app/[locale]/(default)/create/text-to-3d/page.tsx`
```typescript
// 第16行 - 将 false 改回 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true
↓ 改为
const REQUIRE_LOGIN = true;
```

### 2. 后端API提交接口 - `/src/app/api/ai/generate/text-to-3d/route.ts`
```typescript
// 第11行 - 将 false 改回 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true
↓ 改为
const REQUIRE_LOGIN = true;

// 第59-73行 - 删除测试用户创建代码
// 测试模式：如果用户不存在，创建测试用户
if (!user && !REQUIRE_LOGIN) {
  const testUserUuid = uuidv4();
  await db.insert(users).values({
    uuid: testUserUuid,
    email: userEmail,
    credits: 10000, // 给测试用户大量积分
    invite_code: 'TEST',
    nickname: 'Test User',
  });
  ...
}
↓ 删除整段代码
```

### 3. 后端API查询接口 - `/src/app/api/ai/generate/text-to-3d/status/route.ts`
```typescript
// 第9行 - 将 false 改回 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true
↓ 改为
const REQUIRE_LOGIN = true;
```

### 4. 清理测试数据（可选）
如果需要清理测试期间创建的数据：
```sql
-- 删除测试用户
DELETE FROM users WHERE email = 'test@example.com';

-- 删除测试生成记录
DELETE FROM ai_generation_records WHERE user_uuid IN
  (SELECT uuid FROM users WHERE email = 'test@example.com');

-- 删除测试队列记录
DELETE FROM model3d_queue WHERE user_uuid IN
  (SELECT uuid FROM users WHERE email = 'test@example.com');
```

### 恢复检查清单：
- [ ] 前端 `REQUIRE_LOGIN` 改为 `true`（第16行）
- [ ] 后端提交API `REQUIRE_LOGIN` 改为 `true`（第11行）
- [ ] 后端查询API `REQUIRE_LOGIN` 改为 `true`（第9行）
- [ ] 删除测试用户创建代码（第59-73行）
- [ ] 清理测试数据（可选）
- [ ] 重新测试登录功能是否正常

## 📝 测试记录

| 功能 | 状态 | 备注 |
|------|------|------|
| 文生3D - 极速版 | ⏳ 待测试 | |
| 文生3D - 专业版 | ⏳ 待测试 | |
| 图生3D - 单张图片 | ⏳ 待测试 | |
| 图生3D - 多视图 | ⏳ 待测试 | |
| 3D预览功能 | ⏳ 待测试 | |
| AR预览功能 | ⏳ 待测试 | |
| 队列系统 | ⏳ 待测试 | |
| 积分系统 | ⏳ 待测试 | |

---

更新时间: 2024-12-27