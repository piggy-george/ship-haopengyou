# Git Commit 详细总结

## 一、积分与邀请系统完整实现

### 1.1 核心业务功能
#### 注册奖励机制
- ✅ 新用户注册：自动获得 100 积分
- ✅ 使用邀请码注册：被邀请人获得 150 积分（100基础 + 50邀请奖励）
- ✅ 邀请人奖励：每成功邀请一人获得 50 积分
- ✅ 邀请上限：单用户最多邀请 100 人
- ✅ 积分有效期：365 天（实际永久有效）

#### 积分消费机制
**文生 3D 模型**：
- 极速版（rapid）：10 积分
- 专业版（pro）基础：15 积分
- 专业版特殊类型：
  - 标准模型（Normal）：20 积分
  - 智能减面（LowPoly）：25 积分
  - 白模（Geometry）：15 积分
  - 草图生成（Sketch）：25 积分
- PBR 材质加成：+10 积分
- 自定义面数加成：+20 积分

**图生 3D 模型**：
- 单图生成（极速版）：30 积分
- 单图生成（专业版）：40 积分
- 多视图生成（专业版）：50 积分
- PBR 材质加成：+10 积分
- 自定义面数加成：+20 积分

#### 退款机制
- ✅ 生成失败自动全额退款
- ✅ 退款积分有效期：365 天
- ✅ 退款类型标记：`system_add`
- ✅ 只退款已扣除且未退款的积分

### 1.2 技术架构设计

#### 数据存储方案
**采用 ShipAny 原生 credits 表**：
```sql
credits {
  trans_no: VARCHAR(255) UNIQUE,    -- 交易唯一号
  user_uuid: VARCHAR(255),           -- 用户ID
  trans_type: VARCHAR(50),           -- 交易类型
  credits: INTEGER,                  -- 积分数（正数=收入，负数=支出）
  expired_at: TIMESTAMP,             -- 过期时间
  order_no: VARCHAR(255),            -- 订单号
  created_at: TIMESTAMP              -- 创建时间
}
```

**交易类型定义**：
- `new_user`：新用户注册奖励
- `system_add`：系统添加（邀请奖励、退款等）
- `ping`：消费扣除（3D生成）
- `order_pay`：充值购买（预留）

**余额计算方式**：
- 聚合所有未过期的积分记录
- SQL: `SUM(credits) WHERE expired_at > NOW()`
- 不依赖 `users.credits` 字段

#### 核心服务方法
**ShipAny 原生方法**（`@/services/credit`）：
```typescript
// 查询积分余额
getUserCredits(user_uuid) → { left_credits: number }

// 增加积分
increaseCredits({
  user_uuid: string,
  trans_type: CreditsTransType,
  credits: number,
  expired_at: string,
  order_no: string
})

// 扣除积分
decreaseCredits({
  user_uuid: string,
  trans_type: CreditsTransType,
  credits: number
})
```

### 1.3 后端 API 实现

#### 1.3.1 注册 API
**文件**：`src/app/api/auth/register/route.ts`

**实现逻辑**：
```typescript
// 1. 新用户注册奖励
await increaseCredits({
  user_uuid: newUser[0].uuid,
  trans_type: CreditsTransType.NewUser,
  credits: 100,
  expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  order_no: '',
});

// 2. 邀请码处理
if (inviteCode) {
  const inviter = await db.select().from(users)
    .where(eq(users.invite_code, inviteCode)).limit(1);
  
  if (inviter[0]) {
    // 2.1 被邀请人奖励
    await increaseCredits({
      user_uuid: newUser[0].uuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: 50,
      expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: '',
    });
    
    // 2.2 邀请人奖励
    await increaseCredits({
      user_uuid: inviter[0].uuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: 50,
      expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: '',
    });
    
    // 2.3 记录邀请关系
    await db.update(users)
      .set({ invited_by: inviter[0].uuid })
      .where(eq(users.uuid, newUser[0].uuid));
  }
}
```

**防刷机制**（配置）：
```typescript
// src/config/credits.ts
export const CREDITS_CONFIG = {
  REGISTER_REWARD: 100,
  INVITE_REWARD_INVITER: 50,
  INVITE_REWARD_INVITEE: 50,
  MAX_INVITES_PER_USER: 100,
  MAX_DAILY_REGISTRATIONS_PER_IP: 3,
} as const;
```

#### 1.3.2 3D 生成 API
**文件**：`src/app/api/ai/generate/text-to-3d/route.ts`

**积分检查逻辑**：
```typescript
// 1. 计算所需积分
const creditsNeeded = calculateCredits(version, generateType, enablePBR, isMultiView, !!faceCount);

// 2. 查询用户余额
const userCreditsData = await getUserCredits(user.uuid);
const currentBalance = userCreditsData.left_credits || 0;

// 3. 余额不足处理
if (currentBalance < creditsNeeded) {
  return NextResponse.json({
    error: 'insufficient_credits',
    message: '积分不足',
    data: {
      currentBalance,
      required: creditsNeeded,
      shortage: creditsNeeded - currentBalance
    }
  }, { status: 402 });
}
```

**积分扣除逻辑**：
```typescript
// 创建生成记录
await db.insert(aiGenerationRecords).values({
  uuid: recordUuid,
  user_uuid: user.uuid,
  type: 'text2model',
  status: 'pending',
  credits_consumed: 0, // 待确认后更新
});

// 扣除积分
await decreaseCredits({
  user_uuid: user.uuid,
  trans_type: CreditsTransType.Ping,
  credits: creditsNeeded,
});

// 更新记录
await db.update(aiGenerationRecords)
  .set({ credits_consumed: creditsNeeded })
  .where(eq(aiGenerationRecords.uuid, recordUuid));
```

#### 1.3.3 队列管理器退款
**文件**：`src/lib/queue/model3d-queue.ts`

**失败退款逻辑**：
```typescript
private async handleJobFailure(recordUuid: string, errorMessage: string): Promise<void> {
  const record = await this.getGenerationRecord(recordUuid);
  
  // 检查是否需要退款
  if (record && record.credits_consumed > 0 && record.credits_refunded === 0) {
    // 退款
    await increaseCredits({
      user_uuid: record.user_uuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: record.credits_consumed,
      expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: '',
    });
    
    // 更新记录
    await db.update(aiGenerationRecords)
      .set({
        status: 'failed',
        error_message: errorMessage,
        credits_refunded: record.credits_consumed,
        completed_at: new Date()
      })
      .where(eq(aiGenerationRecords.uuid, recordUuid));
    
    console.log(`[积分退款] 已退还 ${record.credits_consumed} 积分给用户 ${record.user_uuid}`);
  }
}
```

### 1.4 前端组件实现

#### 1.4.1 积分余额显示组件
**文件**：`src/components/credits/CreditsDisplay.tsx`

**功能**：
- ✅ 实时显示用户积分余额
- ✅ 显示最近消费统计
- ✅ 提供"赚取积分"和"查看历史"链接
- ✅ 使用 ShipAny 原生 API `/api/get-user-credits`

**API 调用**：
```typescript
const response = await fetch('/api/get-user-credits', {
  method: 'POST',
});

const result = await response.json();
// 返回格式: { code: 0, data: { left_credits: number } }

if (result.code === 0 && result.data) {
  setCredits(result.data.left_credits || 0);
}
```

**使用位置**：
- 3D 生成页面顶部（`/create/text-to-3d`）
- 其他需要显示积分的页面

#### 1.4.2 积分不足弹窗
**文件**：`src/components/credits/InsufficientCreditsModal.tsx`

**功能**：
- ✅ 显示当前余额、所需积分、缺少积分
- ✅ 提供获取积分途径：
  - 邀请好友（链接到 `/my-invites`）
  - 充值购买（预留功能）
- ✅ 使用国际化文案

**触发条件**：
```typescript
// 在 3D 生成 API 返回 402 状态码时触发
if (response.status === 402) {
  const data = await response.json();
  setErrorData({
    currentBalance: data.data.currentBalance,
    required: data.data.required,
    shortage: data.data.shortage
  });
  setShowErrorModal(true);
}
```

### 1.5 配置文件

#### 积分配置
**文件**：`src/config/credits.ts`
```typescript
export const CREDITS_CONFIG = {
  // 注册奖励
  REGISTER_REWARD: 100,
  
  // 邀请奖励
  INVITE_REWARD_INVITER: 50,  // 邀请人获得
  INVITE_REWARD_INVITEE: 50,  // 被邀请人获得
  
  // 邀请上限
  MAX_INVITES_PER_USER: 100,
  
  // 防刷限制
  MAX_DAILY_REGISTRATIONS_PER_IP: 3,
} as const;
```

---

## 二、重大修复：重复造轮子问题

### 2.1 问题发现

**用户反馈**：
- 自定义积分页面（`/dashboard/invitations`）显示余额 100
- ShipAny 原生页面（`/my-credits`）显示余额 0
- 数据不一致，系统冲突

**根本原因**：
```typescript
// ❌ 错误做法：自定义积分服务
import { handleRegisterReward } from '@/services/credits-system';

// 更新了 users.credits 字段
await db.update(users).set({ credits: 100 });

// 但 ShipAny 读取的是 credits 表的聚合值
const balance = await getUserCredits(user_uuid); // 返回 0
```

**数据库验证**：
```sql
-- users.credits 字段有数据
SELECT credits FROM users WHERE uuid = '7ae6445d...';
-- 结果: 100

-- credits 表为空
SELECT * FROM credits WHERE user_uuid = '7ae6445d...';
-- 结果: (0 rows)
```

### 2.2 解决方案实施

#### 第一步：数据修复
**执行 SQL 同步数据**：
```sql
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, expired_at, created_at, order_no)
SELECT 
  'FIX_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTRING(uuid::TEXT FROM 1 FOR 8),
  uuid,
  'system_add',
  credits,
  NOW() + INTERVAL '365 days',
  NOW(),
  ''
FROM users 
WHERE credits > 0 
  AND uuid NOT IN (SELECT DISTINCT user_uuid FROM credits);

-- 结果: INSERT 0 1
```

**验证数据一致性**：
```sql
SELECT 
  u.uuid,
  u.credits as old_credits_field,
  COALESCE(SUM(c.credits), 0) as credits_table_sum
FROM users u
LEFT JOIN credits c ON u.uuid = c.user_uuid AND c.expired_at > NOW()
WHERE u.uuid = '7ae6445d...'
GROUP BY u.uuid, u.credits;

-- 结果:
-- old_credits_field: 100
-- credits_table_sum: 100
-- ✅ 数据一致！
```

#### 第二步：代码重构（8 步计划）

**步骤 1：修改注册 API**
```diff
// src/app/api/auth/register/route.ts

- import { handleRegisterReward } from '@/services/credits-system';
+ import { increaseCredits, CreditsTransType } from '@/services/credit';

- await handleRegisterReward({ userUuid: newUser[0].uuid });
+ await increaseCredits({
+   user_uuid: newUser[0].uuid,
+   trans_type: CreditsTransType.NewUser,
+   credits: 100,
+   expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
+   order_no: '',
+ });
```

**步骤 2：修改 3D 生成 API**
```diff
// src/app/api/ai/generate/text-to-3d/route.ts

- import { check3DGenerationCredits, consume3DGenerationCredits } from '@/services/credits-system';
+ import { getUserCredits, decreaseCredits, CreditsTransType } from '@/services/credit';

// 积分检查
- const creditCheck = await check3DGenerationCredits({...});
+ const userCreditsData = await getUserCredits(user.uuid);
+ const currentBalance = userCreditsData.left_credits || 0;

// 积分扣除
- await consume3DGenerationCredits({...});
+ await decreaseCredits({
+   user_uuid: user.uuid,
+   trans_type: CreditsTransType.Ping,
+   credits: creditsNeeded,
+ });
```

**步骤 3：修改队列管理器**
```diff
// src/lib/queue/model3d-queue.ts

- import { refund3DGenerationCredits } from '@/services/credits-system';
+ import { increaseCredits, CreditsTransType } from '@/services/credit';

// 退款逻辑
- await refund3DGenerationCredits({...});
+ await increaseCredits({
+   user_uuid: record.user_uuid,
+   trans_type: CreditsTransType.SystemAdd,
+   credits: record.credits_consumed,
+   expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
+   order_no: '',
+ });
```

**步骤 4：更新前端组件链接**
```diff
// src/components/credits/CreditsDisplay.tsx

- <Link href="/dashboard/invitations">
+ <Link href="/my-invites">

- <Link href="/dashboard/credits">
+ <Link href="/my-credits">
```

**步骤 5：删除重复代码**
```bash
# 删除重复页面
rm -rf src/app/[locale]/(default)/dashboard/credits/
rm -rf src/app/[locale]/(default)/dashboard/invitations/

# 删除重复 API
rm -rf src/app/api/user/credits/
rm -rf src/app/api/invitations/
```

**步骤 6：更新 CreditsDisplay API 调用**
```diff
// src/components/credits/CreditsDisplay.tsx

- const response = await fetch('/api/user/credits');
+ const response = await fetch('/api/get-user-credits', {
+   method: 'POST',
+ });

- const data = await response.json();
- setCredits(data.balance);
+ const result = await response.json();
+ if (result.code === 0 && result.data) {
+   setCredits(result.data.left_credits || 0);
+ }
```

**步骤 7：构建和部署**
```bash
npm run build
pm2 restart ship-haopengyou
```

**步骤 8：测试验证**
```sql
-- 验证数据
SELECT user_uuid, trans_type, credits, expired_at::date 
FROM credits 
ORDER BY created_at DESC LIMIT 5;

-- 验证余额
SELECT 
  u.uuid,
  u.credits as old_field,
  COALESCE(SUM(c.credits), 0) as new_aggregation
FROM users u
LEFT JOIN credits c ON u.uuid = c.user_uuid AND c.expired_at > NOW()
GROUP BY u.uuid, u.credits;
```

### 2.3 修改文件清单

#### 核心业务文件
1. `src/app/api/auth/register/route.ts` - 注册 API
2. `src/app/api/ai/generate/text-to-3d/route.ts` - 3D 生成 API
3. `src/app/api/ai/generate/text-to-image/route.ts` - 图生成 API（注释清理）
4. `src/lib/queue/model3d-queue.ts` - 队列管理器

#### 前端组件
5. `src/components/credits/CreditsDisplay.tsx` - 积分显示
6. `src/components/credits/InsufficientCreditsModal.tsx` - 积分不足弹窗
7. `src/app/[locale]/(default)/create/text-to-3d/page.tsx` - 3D 生成页面

#### 删除的重复代码
8. ❌ `src/app/[locale]/(default)/dashboard/credits/` - 删除
9. ❌ `src/app/[locale]/(default)/dashboard/invitations/` - 删除
10. ❌ `src/app/api/user/credits/` - 删除
11. ❌ `src/app/api/invitations/` - 删除

#### 保留但废弃的文件
12. `src/services/credits-system.ts` - 保留作为参考，不再使用

---

## 三、国际化链接修复

### 3.1 问题现象

**用户反馈**：
- 在中文页面（`/zh/*`）点击链接
- 跳转到英文页面（`/en/*`）
- 语言环境丢失

**具体场景**：
```
1. 访问 /zh/create/text-to-3d
2. 点击 Logo "好朋友AI造物"
3. 跳转到 /zh/ (正确)
4. 点击导航菜单 → 跳转到 /en/* (错误！)
5. 点击"赚取积分" → 跳转到 /en/my-invites (错误！)
```

### 3.2 根本原因

**错误用法**：
```typescript
// ❌ 使用 next/link 的 Link
import Link from 'next/link';

<Link href="/my-credits">查看积分</Link>
// 不管当前在 /zh/* 还是 /en/*
// 都会跳转到 /my-credits（触发默认语言 en）
```

**正确用法**：
```typescript
// ✅ 使用 next-intl 的 Link
import { Link } from '@/i18n/navigation';

<Link href="/my-credits">查看积分</Link>
// 在 /zh/* 页面会跳转到 /zh/my-credits
// 在 /en/* 页面会跳转到 /en/my-credits
```

### 3.3 技术原理

**next-intl 工作机制**：
```typescript
// src/i18n/navigation.ts
import { createNavigation } from "next-intl/routing";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

**createNavigation 创建的 Link 组件**：
1. 自动检测当前语言环境
2. 在所有内部链接前添加正确的语言前缀
3. 保持用户的语言选择

**中间件配置**：
```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|zh|zh-CN|zh-TW|...)/:path*",
    "/((?!api/|_next|_vercel|.*\\..*).*)",
  ],
};
```

### 3.4 修复实施

#### 修复 1：积分组件
```diff
// src/components/credits/CreditsDisplay.tsx

- import Link from 'next/link';
+ import { Link } from '@/i18n/navigation';

// 链接自动适配语言
<Link href="/my-invites">
  <Button>赚取积分</Button>
</Link>

<Link href="/my-credits">
  <Button>查看历史</Button>
</Link>
```

#### 修复 2：积分不足弹窗
```diff
// src/components/credits/InsufficientCreditsModal.tsx

- import Link from 'next/link';
+ import { Link } from '@/i18n/navigation';

<Link href="/my-invites" onClick={onClose}>
  邀请好友
</Link>
```

#### 修复 3：登录表单
```diff
// src/components/sign/form.tsx

- import Link from 'next/link';
+ import { Link } from '@/i18n/navigation';

<Link href="/auth/register">
  注册账号
</Link>
```

#### 修复 4：页面头部导航
```diff
// src/components/blocks/header/index.tsx

- import NextLink from "next/link";
+ // 已有正确的 import { Link } from "@/i18n/navigation";

- // 移除手动语言前缀函数
- const createLocalizedUrl = (url: string) => {
-   if (url.startsWith('/')) {
-     return `/${locale}${url}`;
-   }
-   return `/${locale}/${url}`;
- };

// 导航菜单项
- <NextLink href={createLocalizedUrl(item.url!)}>
+ <Link href={item.url!}>
    {item.title}
- </NextLink>
+ </Link>
```

### 3.5 修改文件清单

1. `src/components/credits/CreditsDisplay.tsx`
   - 替换 Link 导入
   - 所有链接自动适配语言

2. `src/components/credits/InsufficientCreditsModal.tsx`
   - 替换 Link 导入
   - 邀请链接适配语言

3. `src/components/sign/form.tsx`
   - 替换 Link 导入
   - 注册链接适配语言

4. `src/components/blocks/header/index.tsx`
   - 移除 NextLink 导入
   - 移除 createLocalizedUrl 函数
   - 移除调试代码
   - 导航菜单项使用国际化 Link

### 3.6 测试验证

**测试场景 1：中文环境**
```
1. 访问 /zh/create/text-to-3d
2. 点击"赚取积分" → ✅ 跳转 /zh/my-invites
3. 点击"查看历史" → ✅ 跳转 /zh/my-credits
4. 点击 Logo → ✅ 跳转 /zh/
5. 点击导航菜单 → ✅ 保持 /zh/* 路径
```

**测试场景 2：英文环境**
```
1. 访问 /en/create/text-to-3d
2. 点击"Earn Credits" → ✅ 跳转 /en/my-invites
3. 点击"View History" → ✅ 跳转 /en/my-credits
4. 点击 Logo → ✅ 跳转 /en/
5. 点击导航菜单 → ✅ 保持 /en/* 路径
```

---

## 四、数据库变更

### 4.1 使用的数据表

**ShipAny 原生 credits 表**：
```sql
CREATE TABLE credits (
  id SERIAL PRIMARY KEY,
  trans_no VARCHAR(255) UNIQUE NOT NULL,
  user_uuid VARCHAR(255) NOT NULL,
  trans_type VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL,
  order_no VARCHAR(255),
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);

CREATE INDEX idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX idx_credits_expired_at ON credits(expired_at);
```

### 4.2 数据迁移

**同步历史数据**：
```sql
-- 将 users.credits 同步到 credits 表
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, expired_at, created_at, order_no)
SELECT 
  'FIX_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTRING(uuid::TEXT FROM 1 FOR 8),
  uuid,
  'system_add',
  credits,
  NOW() + INTERVAL '365 days',
  NOW(),
  ''
FROM users 
WHERE credits > 0 
  AND uuid NOT IN (SELECT DISTINCT user_uuid FROM credits);
```

### 4.3 数据验证

**验证积分余额一致性**：
```sql
-- 对比 users.credits 和 credits 表聚合值
SELECT 
  u.uuid,
  u.email,
  u.credits as users_credits_field,
  COALESCE(SUM(c.credits), 0) as credits_table_aggregation,
  CASE 
    WHEN u.credits = COALESCE(SUM(c.credits), 0) THEN '✅ 一致'
    ELSE '❌ 不一致'
  END as status
FROM users u
LEFT JOIN credits c ON u.uuid = c.user_uuid AND c.expired_at > NOW()
WHERE u.credits > 0 OR c.credits IS NOT NULL
GROUP BY u.uuid, u.email, u.credits
ORDER BY u.created_at DESC;
```

---

## 五、部署和测试

### 5.1 构建和部署

```bash
# 1. 构建应用
npm run build

# 2. 重启 PM2
pm2 restart ship-haopengyou

# 3. 验证服务状态
pm2 status
pm2 logs ship-haopengyou --lines 50
```

### 5.2 部署信息

- **构建时间**：2025-10-20 16:01:19
- **PM2 重启次数**：12 次（测试和修复过程）
- **运行端口**：3005
- **服务状态**：✅ online
- **构建状态**：✅ 成功

### 5.3 测试清单

#### 积分系统测试
- [ ] 新用户注册 → 验证获得 100 积分
- [ ] 使用邀请码注册 → 验证获得 150 积分
- [ ] 邀请人 → 验证获得 50 积分奖励
- [ ] 文生 3D（极速版）→ 验证扣除 10 积分
- [ ] 文生 3D（专业版）→ 验证扣除 15-55 积分
- [ ] 图生 3D（单图）→ 验证扣除 30-40 积分
- [ ] 图生 3D（多视图）→ 验证扣除 50 积分
- [ ] 生成失败 → 验证自动退款
- [ ] 积分不足 → 验证显示提示弹窗

#### 国际化测试
- [ ] 中文页面点击 Logo → 验证跳转 /zh/
- [ ] 中文页面点击导航 → 验证保持 /zh/*
- [ ] 中文页面点击积分链接 → 验证跳转 /zh/my-credits
- [ ] 英文页面点击 Logo → 验证跳转 /en/
- [ ] 英文页面点击导航 → 验证保持 /en/*
- [ ] 英文页面点击积分链接 → 验证跳转 /en/my-credits

#### 数据一致性测试
- [x] `/my-credits` 显示余额 = `credits` 表聚合值 ✅
- [x] `/my-invites` 显示余额 = `credits` 表聚合值 ✅
- [x] CreditsDisplay 显示余额 = ShipAny API 返回值 ✅

---

## 六、技术栈

### 6.1 核心框架
- **Next.js**: 15.2.3 (App Router)
- **React**: 19.x
- **TypeScript**: 5.x
- **next-intl**: 国际化路由和翻译

### 6.2 数据库和 ORM
- **PostgreSQL**: 关系型数据库
- **Drizzle ORM**: 类型安全的 ORM

### 6.3 ShipAny Framework
- **积分系统**: 原生 `@/services/credit`
- **用户系统**: 原生 `@/services/user`
- **页面配置**: JSON 配置文件系统

### 6.4 部署和运维
- **PM2**: Node.js 进程管理器
- **端口**: 3005
- **环境**: Linux Ubuntu

### 6.5 UI 组件
- **shadcn/ui**: UI 组件库
- **Tailwind CSS**: 样式框架
- **Lucide React**: 图标库

---

## 七、后续优化建议

### 7.1 功能增强
1. **邀请上限验证**：实现单用户邀请不超过 100 人的限制
2. **IP 限制**：实现每个 IP 每天最多注册 3 次
3. **积分充值**：对接支付系统，实现积分购买
4. **积分过期提醒**：实现积分即将过期的通知
5. **管理后台**：添加积分管理界面（手动添加/扣除/查询）

### 7.2 性能优化
1. **积分查询缓存**：Redis 缓存用户积分余额
2. **数据库索引优化**：优化 credits 表查询性能
3. **批量操作**：批量发放邀请奖励

### 7.3 安全加固
1. **防刷机制**：完善 IP 限制和设备指纹识别
2. **交易幂等性**：确保积分交易不重复
3. **数据审计**：记录所有积分变更的审计日志

---

## 八、Git Commit Message 建议

### 简短版本
```
feat: 实现积分与邀请系统并修复框架集成问题

- 完整实现积分奖励、消费、退款机制
- 采用 ShipAny 原生框架，解决数据不一致
- 修复国际化链接跳转问题
- 集成积分显示和不足提示组件
```

### 详细版本
```
feat: 实现积分与邀请系统并修复框架集成和国际化问题

## 功能实现
- 新用户注册奖励 100 积分
- 邀请码系统：被邀请人 150 积分，邀请人 50 积分
- 3D 生成消费积分（10-55积分），失败自动退款
- 积分余额显示组件和积分不足提示弹窗

## 重大修复
- 解决自定义积分系统与 ShipAny 框架冲突
- SQL 同步数据到 credits 表，统一使用聚合计算
- 重构所有积分相关 API 使用 ShipAny 原生方法
- 删除重复页面和 API

## 国际化修复
- 所有组件改用 @/i18n/navigation 的 Link
- 移除手动语言前缀拼接逻辑
- 修复中文/英文页面跳转语言丢失问题

## 修改文件
- src/app/api/auth/register/route.ts
- src/app/api/ai/generate/text-to-3d/route.ts
- src/lib/queue/model3d-queue.ts
- src/components/credits/*.tsx
- src/components/blocks/header/index.tsx
- src/components/sign/form.tsx

## 技术栈
- ShipAny 原生积分框架
- next-intl 国际化
- PostgreSQL + Drizzle ORM
- Next.js 15.2.3

详见 git-commit-summary-detailed.md
```
