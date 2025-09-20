# ShipAny 框架开发指南

## 目录
1. [框架概述](#框架概述)
2. [核心技术栈](#核心技术栈)
3. [快速开始](#快速开始)
4. [项目结构](#项目结构)
5. [核心功能模块](#核心功能模块)
6. [开发教程](#开发教程)
7. [部署指南](#部署指南)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)

## 框架概述

ShipAny 是一个基于 Next.js 的 AI SaaS 开发框架，专为快速开发和部署 AI 驱动的 SaaS 应用而设计。它提供了完整的功能模块、精美的 UI 组件和强大的集成能力，让开发者能够在几天内完成从想法到上线的全过程。

### 核心特性

- **🚀 快速开发**：内置常用功能模块，开箱即用
- **🎨 精美界面**：基于 shadcn/ui 的现代化 UI 组件库
- **🔐 安全可靠**：完整的认证授权和数据安全方案
- **💰 商业化支持**：集成多种支付方式和订阅管理
- **🌍 国际化**：多语言支持，轻松拓展全球市场
- **📊 数据分析**：内置用户行为分析和业务数据统计
- **🤖 AI 集成**：预置多种 AI 能力接口

## 核心技术栈

### 前端技术
- **框架**: Next.js 14.2.3 (App Router)
- **UI 组件**: shadcn/ui + Radix UI
- **样式**: TailwindCSS 4.0 (带 oklch 颜色)
- **语言**: TypeScript 5.0
- **状态管理**: React Hooks + Context
- **表单处理**: React Hook Form + Zod

### 后端技术
- **运行时**: Node.js + Edge Runtime
- **数据库**: PostgreSQL (通过 Supabase)
- **ORM**: Prisma 5.14
- **认证**: NextAuth.js 5.0 (Auth.js)
- **API**: REST API + Server Actions

### 基础设施
- **托管平台**: Vercel/Cloudflare/Self-hosted
- **数据库服务**: Supabase
- **文件存储**: UploadThing/Supabase Storage
- **邮件服务**: Resend
- **支付服务**: Stripe/Creem
- **分析服务**: Google Analytics/Umami/PostHog

### 开发工具
- **包管理**: npm/yarn/pnpm
- **代码格式化**: Prettier
- **代码检查**: ESLint
- **AI 辅助**: 推荐使用 Cursor/v0

## 快速开始

### 1. 获取代码

1. 在 [ShipAny 官网](https://shipany.ai/pricing) 购买授权
2. 激活订单并绑定 Github 账号
3. 克隆代码仓库：

```bash
git clone https://github.com/shipanyai/shipany-template-one.git
cd shipany-template-one
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量：

```env
# 数据库
DATABASE_URL=
DIRECT_URL=

# 认证
AUTH_SECRET=
AUTH_TRUST_HOST=true

# 第三方服务
RESEND_API_KEY=
STRIPE_SECRET_KEY=
UPLOADTHING_SECRET=
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看项目。

## 项目结构

```
shipany-template-one/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   │   ├── (auth)/       # 认证相关页面
│   │   ├── (landing)/    # 落地页
│   │   ├── (main)/       # 主应用页面
│   │   ├── admin/        # 管理后台
│   │   └── api/          # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── blocks/           # 页面级组件块
│   └── forms/            # 表单组件
├── lib/                  # 工具库
│   ├── db.ts            # 数据库配置
│   ├── auth.ts          # 认证配置
│   ├── stripe.ts        # 支付配置
│   └── utils.ts         # 工具函数
├── types/               # TypeScript 类型定义
├── public/              # 静态资源
├── locales/             # 国际化文件
└── prisma/              # 数据库模型
```

## 核心功能模块

### 1. 用户认证与管理
- **登录方式**：邮箱密码、OAuth（Google、GitHub）
- **会话管理**：基于 JWT 的安全会话
- **权限控制**：角色基础的访问控制（RBAC）
- **用户资料**：完整的个人信息管理

### 2. 数据库设计
- **用户表**：存储用户基本信息和认证数据
- **订阅表**：管理用户订阅状态和计划
- **交易表**：记录所有支付交易
- **内容表**：存储用户生成的内容

### 3. 支付与订阅
- **Stripe 集成**：完整的订阅管理流程
- **Creem 支付**：支持多种支付方式
- **订阅计划**：灵活的定价策略配置
- **支付通知**：Webhook 自动处理

### 4. 内容管理（CMS）
- **博客系统**：Markdown 支持，SEO 优化
- **页面管理**：动态创建和编辑页面
- **媒体管理**：图片上传和管理
- **版本控制**：内容历史记录

### 5. 国际化（i18n）
- **多语言支持**：中文、英文、日文等
- **动态切换**：用户可自主选择语言
- **SEO 友好**：每种语言独立 URL
- **内容翻译**：AI 辅助翻译工具

### 6. 数据分析
- **用户分析**：注册、活跃度、留存率
- **业务指标**：收入、订阅、转化率
- **行为追踪**：页面访问、功能使用
- **自定义报表**：灵活的数据可视化

### 7. 邮件服务
- **事务邮件**：注册确认、密码重置
- **营销邮件**：产品更新、促销活动
- **邮件模板**：精美的 HTML 模板
- **发送追踪**：开信率、点击率统计

## 开发教程

### 1. 自定义 Landing Page

Landing Page 是网站的门面，ShipAny 提供了灵活的自定义方式：

#### 修改内容
编辑 JSON 配置文件：
- 英文：`/config/landing/en.json`
- 中文：`/config/landing/zh-CN.json`

#### 使用 AI 生成内容
```prompt
基于以下信息生成 Landing Page 内容：
- 产品名称：[你的产品名]
- 目标用户：[目标用户描述]
- 核心功能：[主要功能列表]
- 独特价值：[产品优势]
```

#### 修改页面结构
编辑布局文件 `/app/[locale]/(landing)/page.tsx`，可以添加或删除组件。

### 2. 创建新页面

#### 基础页面
```tsx
// app/[locale]/(main)/new-page/page.tsx
import { getTranslations } from 'next-intl/server'

export default async function NewPage() {
  const t = await getTranslations()
  
  return (
    <div className="container mx-auto py-10">
      <h1>{t('newPage.title')}</h1>
      {/* 页面内容 */}
    </div>
  )
}
```

#### 动态路由页面
```tsx
// app/[locale]/(main)/posts/[id]/page.tsx
interface Props {
  params: { id: string; locale: string }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.id)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

### 3. 创建新组件

#### 基础组件模板
```tsx
// components/custom/MyComponent.tsx
import { cn } from '@/lib/utils'

interface MyComponentProps {
  className?: string
  title: string
  children: React.ReactNode
}

export function MyComponent({ 
  className, 
  title, 
  children 
}: MyComponentProps) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}
```

#### 服务端组件
```tsx
// components/custom/ServerComponent.tsx
import { db } from '@/lib/db'

export async function ServerComponent() {
  const data = await db.post.findMany()
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  )
}
```

### 4. API 开发

#### RESTful API
```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const posts = await db.post.findMany({
    where: { userId: session.user.id }
  })
  
  return NextResponse.json({ data: posts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const body = await req.json()
  
  const post = await db.post.create({
    data: {
      ...body,
      userId: session.user.id
    }
  })
  
  return NextResponse.json({ data: post })
}
```

#### Server Actions
```ts
// app/[locale]/(main)/posts/actions.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(data: FormData) {
  const session = await auth()
  
  const post = await db.post.create({
    data: {
      title: data.get('title') as string,
      content: data.get('content') as string,
      userId: session!.user.id
    }
  })
  
  revalidatePath('/posts')
  return { success: true, data: post }
}
```

## 部署指南

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 创建新项目
3. 导入 GitHub 仓库
4. 配置环境变量
5. 点击部署

### Cloudflare 部署

1. 切换到 `cloudflare` 分支
2. 配置 `wrangler.toml`
3. 运行部署命令：
```bash
npm run cf:deploy
```

### 自托管部署（Dokploy）

1. 在服务器安装 Dokploy
2. 创建新项目
3. 连接 Git 仓库
4. 配置构建命令和环境变量
5. 触发部署

## 最佳实践

### 1. 代码组织
- 使用 Feature-based 结构组织代码
- 保持组件小而专注
- 复用通用逻辑和组件
- 遵循 SOLID 原则

### 2. 性能优化
- 使用 Next.js 的图片优化
- 实施适当的缓存策略
- 延迟加载非关键资源
- 优化数据库查询

### 3. 安全考虑
- 永远不要相信用户输入
- 使用环境变量存储敏感信息
- 实施适当的权限检查
- 定期更新依赖项

### 4. SEO 优化
- 为每个页面设置适当的元数据
- 使用结构化数据
- 优化页面加载速度
- 创建 XML 站点地图

### 5. 用户体验
- 提供清晰的错误消息
- 实现加载状态
- 确保移动端友好
- 支持键盘导航

## 常见问题

### Q: 如何添加新的支付方式？
A: 在 `/lib/payment` 目录下创建新的支付提供商集成，实现统一的支付接口。

### Q: 如何自定义邮件模板？
A: 编辑 `/emails` 目录下的模板文件，使用 React Email 组件编写。

### Q: 如何添加新的语言支持？
A: 在 `/locales` 目录下添加新的语言文件，并在 `i18n.ts` 中注册。

### Q: 如何优化数据库性能？
A: 使用 Prisma 的查询优化功能，添加适当的索引，考虑使用缓存。

### Q: 如何处理文件上传？
A: 使用 UploadThing 或 Supabase Storage，它们提供了简单的 API 和 CDN 支持。

## 资源链接

- [ShipAny 官网](https://shipany.ai)
- [官方文档](https://docs.shipany.ai)
- [GitHub 仓库](https://github.com/shipanyai/shipany-template-one)（需要授权）
- [社区论坛](https://community.shipany.ai)
- [技术支持](mailto:support@shipany.ai)

## 更新日志

- **v1.0.0** - 初始版本发布
- **v1.1.0** - 添加 AI 功能集成
- **v1.2.0** - 优化性能和用户体验
- **v1.3.0** - 新增管理后台功能

---

**注意**：请遵守 ShipAny 的使用协议，不要公开分享源代码。如有问题，请联系官方技术支持。