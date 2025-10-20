# Git Commit 总结

## 功能实现：积分与邀请系统

### 1. 核心功能
- ✅ 新用户注册获得 100 积分
- ✅ 邀请码系统：被邀请人 +150 积分（100基础+50奖励），邀请人 +50 积分
- ✅ 3D 生成消费积分（文生3D: 10-55积分，图生3D: 30-50积分）
- ✅ 生成失败自动退款
- ✅ 积分永久有效（365天过期）
- ✅ 单用户邀请上限 100 人

### 2. 技术架构
- ✅ 采用 ShipAny 原生积分框架（`@/services/credit`）
- ✅ 数据存储：使用 `credits` 表聚合模式，而非 `users.credits` 字段
- ✅ 交易类型：`new_user`（注册）、`system_add`（邀请/退款）、`ping`（消费）

### 3. API 实现
- ✅ 注册 API：集成积分奖励和邀请逻辑
- ✅ 3D生成 API：积分检查、扣除、退款机制
- ✅ 队列管理器：失败自动退款

### 4. 前端组件
- ✅ CreditsDisplay：积分余额显示卡片
- ✅ InsufficientCreditsModal：积分不足提示弹窗
- ✅ 3D生成页面：积分余额显示

### 5. 页面路由
- ✅ `/my-credits`：积分历史（ShipAny 原生）
- ✅ `/my-invites`：邀请链接（ShipAny 原生）

## 重大修复：重复造轮子问题

### 问题
- ❌ 自定义积分系统与 ShipAny 原生框架冲突
- ❌ 数据不一致：自定义页面显示 100，原生页面显示 0

### 解决方案
1. ✅ 数据修复：SQL 同步 `users.credits` 到 `credits` 表
2. ✅ 代码重构：全部改用 ShipAny 原生方法
3. ✅ 删除重复代码：移除自定义页面和 API
4. ✅ 更新组件链接：指向 ShipAny 原生页面

### 修改文件
- `src/app/api/auth/register/route.ts`
- `src/app/api/ai/generate/text-to-3d/route.ts`
- `src/lib/queue/model3d-queue.ts`
- `src/components/credits/CreditsDisplay.tsx`
- `src/components/credits/InsufficientCreditsModal.tsx`

## 国际化链接修复

### 问题
- ❌ 中文页面点击链接跳转到英文页面
- ❌ 语言环境丢失

### 解决方案
- ✅ 将所有 `import Link from 'next/link'` 改为 `import { Link } from '@/i18n/navigation'`
- ✅ 移除手动拼接语言前缀的代码
- ✅ 使用 next-intl 的国际化 Link 组件

### 修改文件
- `src/components/credits/CreditsDisplay.tsx`
- `src/components/credits/InsufficientCreditsModal.tsx`
- `src/components/sign/form.tsx`
- `src/components/blocks/header/index.tsx`

## 配置文件
- `src/config/credits.ts`：积分配置参数
- `src/i18n/pages/landing/*.json`：页面配置

## 数据库
- 使用 ShipAny 原生 `credits` 表
- 聚合计算余额，支持积分过期

## 测试状态
- ✅ 构建成功
- ✅ PM2 部署成功
- ✅ 数据一致性验证通过
- ⏳ 国际化链接待用户验证

## 技术栈
- Next.js 15.2.3 + next-intl
- PostgreSQL + Drizzle ORM
- ShipAny Framework
- PM2 进程管理
