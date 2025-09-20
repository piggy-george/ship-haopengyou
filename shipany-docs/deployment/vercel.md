# 部署到 Vercel

## 部署流程

### 1. 准备工作
- 先在本地开发好你自己的项目，代码提交到 Github 私有仓库。
- **重要提示**：请务必选择私有仓库，不要公开发布 ShipAny 的代码，拒绝盗版。

### 2. 在 Vercel 控制台创建新项目
在 Vercel 控制台创建新项目，导入代码仓库，一键部署。

![vercel-new-project](vercel-new-project.png)

### 3. 等待构建完成
等构建完成，即可在 Vercel 控制台看到你的项目。

![vercel-console](vercel-console.png)

### 4. 访问项目
打开域名，即可访问你的项目。

> 你也可以在 Vercel 控制台，[添加自定义域名](https://vercel.com/docs/projects/domains/add-a-domain)

![vercel-preview](vercel-preview.png)

### 5. 修改环境变量

> **重要提示**：先在本地编辑好 `.env.production` 的内容，填写生产环境配置，再复制粘贴到 Vercel 的环境变量中。

下一次推送代码，自动重新部署，应用新的环境变量。

![vercel-env](vercel-env.png)

## 环境变量配置示例

```bash
# -----------------------------------------------------------------------------
# Web Information
# -----------------------------------------------------------------------------
NEXT_PUBLIC_WEB_URL = "http://localhost:3000"
NEXT_PUBLIC_PROJECT_NAME = "ShipAny"

# -----------------------------------------------------------------------------
# Database with Supabase
# -----------------------------------------------------------------------------
# https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
# Set your Supabase DATABASE_URL
DATABASE_URL = ""

# -----------------------------------------------------------------------------
# Auth with next-auth
# https://authjs.dev/getting-started/installation?framework=Next.js
# Set your Auth URL and Secret
# Secret can be generated with `openssl rand -base64 32`
# -----------------------------------------------------------------------------
AUTH_SECRET = "Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="
AUTH_URL = "http://localhost:3000/api/auth"
AUTH_TRUST_HOST = true

# Google Auth
# https://authjs.dev/getting-started/providers/google
AUTH_GOOGLE_ID = ""
AUTH_GOOGLE_SECRET = ""
NEXT_PUBLIC_AUTH_GOOGLE_ID = ""
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = "false"
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED = "false"

# Github Auth
# https://authjs.dev/getting-started/providers/github
AUTH_GITHUB_ID = ""
AUTH_GITHUB_SECRET = ""
NEXT_PUBLIC_AUTH_GITHUB_ENABLED = "false"

# -----------------------------------------------------------------------------
# Analytics with Google Analytics
# https://analytics.google.com
# -----------------------------------------------------------------------------
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = ""

# -----------------------------------------------------------------------------
# Analytics with OpenPanel
# https://openpanel.dev
# -----------------------------------------------------------------------------
NEXT_PUBLIC_OPENPANEL_CLIENT_ID = ""

# Analytics with Plausible
# https://plausible.io/
NEXT_PUBLIC_PLAUSIBLE_DOMAIN = ""
NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL = ""

# -----------------------------------------------------------------------------
# Payment with Stripe
# https://docs.stripe.com/keys
# -----------------------------------------------------------------------------
STRIPE_PUBLIC_KEY = ""
STRIPE_PRIVATE_KEY = ""
STRIPE_WEBHOOK_SECRET = ""

NEXT_PUBLIC_PAY_SUCCESS_URL = "http://localhost:3000/my-orders"
NEXT_PUBLIC_PAY_FAIL_URL = "http://localhost:3000/#pricing"
NEXT_PUBLIC_PAY_CANCEL_URL = "http://localhost:3000/#pricing"

NEXT_PUBLIC_LOCALE_DETECTION = "false"

ADMIN_EMAILS = ""

NEXT_PUBLIC_DEFAULT_THEME = "light"

# -----------------------------------------------------------------------------
# Storage with aws s3 sdk
# https://docs.aws.amazon.com/s3/index.html
# -----------------------------------------------------------------------------
STORAGE_ENDPOINT = ""
STORAGE_REGION = ""
STORAGE_ACCESS_KEY = ""
STORAGE_SECRET_KEY = ""
STORAGE_BUCKET = ""
STORAGE_DOMAIN = ""

# Google Adsence Code
# https://adsense.com/
NEXT_PUBLIC_GOOGLE_ADCODE = ""
```

## 注意事项

1. **代码仓库**：必须使用私有仓库，不要公开发布 ShipAny 代码
2. **环境变量**：先在本地配置好 `.env.production`，再复制到 Vercel
3. **自动部署**：每次推送代码到 Github，Vercel 会自动重新部署
4. **自定义域名**：可以在 Vercel 控制台添加自定义域名

## 参考资料

- [Deploy to Vercel](https://vercel.com/docs/deployments/deployment-methods)
- [添加自定义域名](https://vercel.com/docs/projects/domains/add-a-domain)

---
最后更新时间：2025年6月11日