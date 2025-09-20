# ShipAny 文档整理

本目录包含了从 ShipAny 官方文档（https://docs.shipany.ai/zh）整理的所有教程内容。

## 文档结构

### 基础内容
1. **01-前置说明.md** - ShipAny 框架介绍、技术依赖、环境配置要求
2. **02-创建新页面.md** - 如何在 ShipAny 中创建新的页面
3. **03-创建新组件.md** - 使用 AI 辅助创建 React 组件
4. **04-API调用.md** - 创建和调用 API 接口示例
5. **05-更新网站协议.md** - 更新隐私政策和服务条款

### 功能特性
6. **06-数据库.md** - 使用 drizzle-orm 配置和管理数据库
7. **07-登录鉴权.md** - 配置谷歌登录、Github 登录等
8. **08-数据统计.md** - 集成 Google Analytics 和 OpenPanel
9. **09-国际化.md** - 使用 next-intl 实现多语言支持
10. **10-文件存储.md** - 配置 AWS S3 兼容的云存储服务
11. **11-SEO.md** - SEO 优化配置和最佳实践
12. **12-博客.md** - 内置 CMS 系统管理博客内容

### 服务集成
13. **13-邮件服务.md** - 使用 Resend 发送邮件
14. **14-支付服务-Stripe.md** - Stripe 支付集成详细教程
15. **15-支付服务-Creem.md** - Creem 支付集成教程
16. **16-用户反馈.md** - 用户反馈收集组件使用
17. **17-邀请返佣.md** - 邀请返佣系统配置和自定义

## ShipAny 核心技术栈

- **框架**: Next.js 14+ (App Router)
- **样式**: TailwindCSS
- **UI组件**: shadcn/ui
- **数据库**: Supabase + drizzle-orm
- **认证**: next-auth
- **国际化**: next-intl
- **支付**: Stripe / Creem
- **邮件**: Resend
- **统计**: Google Analytics / OpenPanel
- **存储**: AWS S3 兼容服务

## AI 集成功能

ShipAny 提到支持以下 AI 功能（部分文档页面未能访问）：
- 可灵 AI 视频生成
- Dall-E 图片生成
- OpenAI Chat Completion
- OpenAI TTS（文本转语音）

## 快速开始

1. 获取 ShipAny 代码：从官网购买并激活
2. 本地开发：
   ```bash
   git clone git@github.com:shipanyai/shipany-template-one.git my-shipany-project
   cd my-shipany-project
   pnpm install
   cp .env.example .env.development
   pnpm dev
   ```
3. 访问 http://localhost:3000 预览项目

## 部署

ShipAny 支持多种部署方式：
- Vercel（推荐）
- Cloudflare Pages
- Dokploy
- Docker

详细部署教程请参考官方文档。

---

最后更新：2025-09-20

注：本文档整理自 ShipAny 官方文档，部分 AI 集成相关的页面（如图片生成、视频生成、文本生成等）在访问时返回 404 错误，可能是文档结构发生了变化或这些功能还在开发中。建议查看最新的官方文档获取完整信息。