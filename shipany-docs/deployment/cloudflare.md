# 部署到 Cloudflare

ShipAny 使用 OpenNext 框架，支持一键部署到 Cloudflare。

## 使用 cloudflare 分支

使用 ShipAny 开发新项目时，如果希望部署到 Cloudflare Workers，建议拉取 `cloudflare` 分支，无需额外修改，支持一键部署。

```bash
git clone -b cloudflare git@github.com:shipanyai/shipany-template-one.git my-shipany-project
```

## 部署流程

### 1. 在项目根目录创建生产环境配置文件 `.env.production`

```bash
cp .env.example .env.production
```

按需修改 `.env.production` 文件中的配置：项目域名、数据库、登录授权等配置。

### 2. 在项目根目录创建 `wrangler.toml` 文件

```bash
cp wrangler.toml.example wrangler.toml
```

把上一步在 `.env.production` 文件中配置好的生产环境变量，复制到 `wrangler.toml` 文件中的 `[vars]` 下面，并且修改 `wrangler.toml` 文件中的项目名称 `name`。

### 3. 部署到 Cloudflare

在项目根目录运行以下命令：

```bash
npm run cf:deploy
```

按照提示，输入要部署的项目名称和分支名称(main)，连接上你的 Cloudflare 账号，然后等待部署完成。

### 4. 查看部署结果

进入 Cloudflare 控制台，可以看到项目已经成功部署。

### 5. 访问项目

使用默认生成的域名可访问项目，绑定自定义域名可正式上线。

## 注意事项

1. **使用 cloudflare 分支**：如果计划部署到 Cloudflare，建议直接使用 cloudflare 分支，已经做好了适配
2. **环境变量配置**：需要将 `.env.production` 中的环境变量复制到 `wrangler.toml` 的 `[vars]` 部分
3. **项目名称**：记得在 `wrangler.toml` 中修改项目名称
4. **OpenNext 框架**：ShipAny 使用 OpenNext 框架来支持 Cloudflare 部署

## 配置文件说明

### wrangler.toml 配置结构

```toml
name = "你的项目名称"
compatibility_date = "2023-01-01"

[vars]
# 从 .env.production 复制所有环境变量到这里
NEXT_PUBLIC_WEB_URL = "你的项目URL"
NEXT_PUBLIC_PROJECT_NAME = "你的项目名称"
DATABASE_URL = "你的数据库URL"
# ... 其他环境变量
```

## 参考资料

- [Open-Next 官方文档](https://open-next.js.org/)
- [NextJS 应用从 Vercel 迁移到 Cloudflare](https://developers.cloudflare.com/workers/tutorials/migrate-from-vercel/)

---
最后更新时间：2025年6月11日