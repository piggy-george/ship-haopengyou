# Supabase 使用说明与配置

> 📅 创建时间：2025-01-14  
> 🎯 检查结果：代码中有 Supabase 集成准备，但未完全实现  
> ✅ 您的配置：可以直接使用

---

## 📊 当前状态分析

### ✅ 您提供的 Supabase 配置

```bash
SUPABASE_URL="https://dyyhczjmychfekhotnyt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhjempteWNoZmVraG90bnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDcxMDAsImV4cCI6MjA2MjY4MzEwMH0.CLquhDT28tQN939hwNcXAYoZEdEeixAErxoUWPMG-z8"
```

### 🔍 代码检查结果

#### 1. **Supabase 依赖包** - ❌ 未安装

```bash
# package.json 中没有 Supabase 依赖
# 需要安装：
npm install @supabase/supabase-js
```

#### 2. **Supabase 客户端初始化** - ❌ 不存在

```
❌ 没有找到 Supabase 客户端初始化代码
❌ 没有 src/lib/supabase.ts 文件
❌ 没有 createClient 调用
```

#### 3. **Supabase Auth** - ❌ 未集成

```
✅ 当前使用：next-auth (NextAuth.js)
❌ 没有使用：Supabase Auth
```

#### 4. **Supabase Storage** - ⚠️ 部分准备

在 `src/lib/ai/stable-diffusion.ts` 文件中发现：

```typescript
// 第86-89行：注释掉的 Supabase Storage 代码
async function uploadBase64Image(base64Data: string): Promise<string> {
  try {
    // 实际项目中应该上传到Supabase Storage
    // const { data, error } = await supabase.storage
    //   .from('ai-creations')
    //   .upload(fileName, base64ToBlob(base64Data))

    // 暂时返回一个模拟URL ❌
    return `https://storage.example.com/ai-creations/${fileName}`
  }
}
```

**结论**：代码中有使用 Supabase Storage 的意图，但未实现。

#### 5. **数据库配置** - ⚠️ 使用本地数据库

当前 `.env` 配置：
```bash
DATABASE_URL="postgresql://shipany_user:shipany_password_2024@localhost:5432/shipany_ai"
```

**这是本地 PostgreSQL，不是 Supabase！**

---

## 🎯 Supabase 可以用于什么？

### 选项 1️⃣：使用 Supabase PostgreSQL 数据库（推荐 ✅）

**优点**：
- ✅ 云端托管，无需自己维护
- ✅ 自动备份
- ✅ 免费额度充足
- ✅ 简单替换 DATABASE_URL 即可

**操作步骤**：

1. **获取 Supabase 数据库连接字符串**

登录您的 Supabase 项目，在 Settings > Database 中找到：

```bash
# 直接连接字符串（适用于 Drizzle ORM）
postgresql://postgres:[YOUR-PASSWORD]@db.dyyhczjmychfekhotnyt.supabase.co:5432/postgres

# 或者连接池字符串（推荐用于生产环境）
postgresql://postgres:[YOUR-PASSWORD]@db.dyyhczjmychfekhotnyt.supabase.co:6543/postgres?pgbouncer=true
```

2. **更新 `.env` 配置**

```bash
# 替换为 Supabase 数据库连接
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dyyhczjmychfekhotnyt.supabase.co:5432/postgres"
```

3. **迁移数据库**

```bash
# 在 Supabase 数据库中创建表结构
npm run db:push
```

4. **重启应用**

```bash
pm2 restart ship-haopengyou
```

**✅ 无需修改代码，只需替换连接字符串！**

---

### 选项 2️⃣：使用 Supabase Storage 存储文件

**用途**：
- 存储 AI 生成的图片
- 存储 3D 模型文件
- 存储用户上传的文件

**需要实现的步骤**：

#### 1. 安装 Supabase SDK

```bash
npm install @supabase/supabase-js
```

#### 2. 创建 Supabase 客户端

**新建文件**：`src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### 3. 创建 Storage Bucket

在 Supabase Dashboard：
1. 进入 Storage
2. 创建新 Bucket：`ai-creations`
3. 设置为公开访问（或根据需要设置权限）

#### 4. 实现文件上传功能

**修改文件**：`src/lib/ai/stable-diffusion.ts`

```typescript
import { supabase } from '@/lib/supabase';

async function uploadBase64Image(base64Data: string): Promise<string> {
  const fileName = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
  
  try {
    // 将 base64 转换为 Blob
    const blob = base64ToBlob(base64Data);
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('ai-creations')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 获取公开访问 URL
    const { data: { publicUrl } } = supabase.storage
      .from('ai-creations')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Failed to upload generated image:', error);
    throw new Error('图片上传失败');
  }
}
```

#### 5. 更新 `.env` 配置

```bash
# 您已有的配置
SUPABASE_URL="https://dyyhczjmychfekhotnyt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
AI_STORAGE_BUCKET="ai-creations"
```

---

### 选项 3️⃣：使用 Supabase Auth（不推荐 ❌）

**为什么不推荐？**

当前项目使用 **next-auth**，已经实现了：
- ✅ Google OAuth 登录
- ✅ Github OAuth 登录
- ✅ 用户管理
- ✅ Session 管理

**如果改用 Supabase Auth：**
- ❌ 需要重构整个认证系统
- ❌ 需要重写所有登录相关代码
- ❌ 与现有系统冲突
- ❌ 工作量巨大，风险高

**建议**：继续使用 next-auth，不要改用 Supabase Auth

---

## 📋 推荐配置方案

### 🎯 **方案A：快速上手（5分钟）**

**只使用 Supabase 作为数据库**

1. 获取 Supabase 数据库连接字符串
2. 替换 `.env` 中的 `DATABASE_URL`
3. 运行 `npm run db:push`
4. 重启应用

**优点**：
- ✅ 改动最小
- ✅ 立即可用
- ✅ 云端数据库，更安全

---

### 🎯 **方案B：完整功能（1-2小时）**

**使用 Supabase 数据库 + Storage**

1. 替换数据库连接（方案A）
2. 安装 Supabase SDK
3. 创建 Supabase 客户端
4. 实现文件上传功能
5. 创建 Storage Bucket

**优点**：
- ✅ 数据库 + 文件存储都在云端
- ✅ 统一管理
- ✅ 成本低（免费额度充足）

---

## ⚠️ 重要提醒

### 关于认证系统

**您的问题**：
> 用户在首次注册的时候，输入邮箱和密码后，自动在 Supabase 创建好用户信息

**答案**：
- ❌ **不是**在 Supabase Auth 创建用户
- ✅ **是**在 Supabase PostgreSQL 数据库的 `users` 表中创建用户
- ✅ 使用 next-auth 进行认证
- ✅ 密码存储在数据库中（bcrypt 加密）

**实现方式**：
```
用户注册
  ↓
输入邮箱+密码
  ↓
bcrypt 加密密码
  ↓
存入 Supabase PostgreSQL 数据库（users 表）
  ↓
使用 next-auth 登录验证
  ↓
登录成功
```

**不需要使用 Supabase Auth！**

---

## 🚀 立即可用的配置

### 第一步：更新 `.env` 文件

```bash
# ================================
# Supabase 配置
# ================================

# 1. Supabase 项目配置（您已提供）
SUPABASE_URL="https://dyyhczjmychfekhotnyt.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5eWhjempteWNoZmVraG90bnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDcxMDAsImV4cCI6MjA2MjY4MzEwMH0.CLquhDT28tQN939hwNcXAYoZEdEeixAErxoUWPMG-z8"

# 2. Storage Bucket 名称
AI_STORAGE_BUCKET="ai-creations"

# 3. 数据库连接（需要从 Supabase 获取密码）
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dyyhczjmychfekhotnyt.supabase.co:5432/postgres"
```

### 第二步：获取数据库密码

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目：`dyyhczjmychfekhotnyt`
3. 进入 Settings > Database
4. 复制 Connection String
5. 替换 `[YOUR-PASSWORD]` 为您的数据库密码

### 第三步：迁移数据库（可选）

**如果要使用 Supabase 数据库**：

```bash
# 1. 更新 .env 中的 DATABASE_URL

# 2. 在 Supabase 中创建表结构
npm run db:push

# 3. 重启应用
pm2 restart ship-haopengyou
```

**如果继续使用本地数据库**：

不需要修改，保持现状即可。

---

## 📊 配置对比

| 功能 | 当前状态 | 使用 Supabase 后 |
|------|---------|-----------------|
| **数据库** | 本地 PostgreSQL | Supabase PostgreSQL ✅ |
| **认证系统** | next-auth | next-auth（保持不变）✅ |
| **文件存储** | 本地存储 | Supabase Storage（需实现）⚠️ |
| **用户表** | 本地 users 表 | Supabase users 表 ✅ |
| **邮箱密码登录** | 需要实现 | 需要实现（参考另一份文档）⚠️ |

---

## ✅ 总结

### 回答您的问题：

**Q: 代码是不是本来就支持 Supabase，只需要把密钥填写就可以了？**

**A: 部分正确！**

1. **数据库**：✅ 只需替换 `DATABASE_URL` 即可使用 Supabase PostgreSQL
2. **Storage**：⚠️ 需要安装 SDK 并实现上传代码（有模板，很简单）
3. **认证**：❌ 不使用 Supabase Auth，继续用 next-auth

### 推荐操作：

**立即可做**：
1. ✅ 将数据库迁移到 Supabase（5分钟）
2. ✅ 填写您的 Supabase 配置到 `.env`

**可选操作**：
1. ⭕ 实现 Supabase Storage 上传（1-2小时）
2. ⭕ 实现邮箱密码登录（参考另一份文档）

---

## 🔧 下一步

需要我帮您：
1. 获取 Supabase 数据库连接字符串？
2. 实现 Supabase Storage 文件上传？
3. 迁移本地数据到 Supabase？
4. 实现邮箱密码登录功能？

请告诉我您的需求！🚀

---

**文档版本**：v1.0  
**最后更新**：2025-01-14  
**维护者**：开发团队






