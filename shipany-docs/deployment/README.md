# ShipAny 部署指南

ShipAny 支持多种部署方式，你可以根据自己的需求选择合适的部署平台。

## 部署方式对比

| 部署平台 | 适用场景 | 优势 | 注意事项 |
|---------|---------|------|---------|
| **Vercel** | 快速部署、自动扩容 | 一键部署、自动 HTTPS、全球 CDN | 需要 Vercel 账号 |
| **Cloudflare** | Cloudflare Workers 部署 | 边缘计算、低延迟、免费额度高 | 需要使用 cloudflare 分支 |
| **Dokploy** | 自托管、完全控制 | 数据自主、灵活配置、多项目管理 | 需要自己的服务器 |

## 通用准备工作

无论选择哪种部署方式，都需要先完成以下准备工作：

1. **获取 ShipAny 代码**
   - 购买并激活 ShipAny
   - 从 Github 私有仓库克隆代码

2. **本地开发和定制**
   - 修改网站配色、内容、Logo 等
   - 配置环境变量
   - 测试功能正常

3. **创建私有代码仓库**
   - 将定制后的代码上传到你自己的 Github 私有仓库
   - **重要**：不要公开发布 ShipAny 代码

## 环境变量配置

所有部署方式都需要配置环境变量，主要包括：

### 基础配置
```bash
# Web 信息
NEXT_PUBLIC_WEB_URL = "你的网站URL"
NEXT_PUBLIC_PROJECT_NAME = "你的项目名称"

# 数据库
DATABASE_URL = "数据库连接字符串"

# 认证
AUTH_SECRET = "随机生成的密钥"
AUTH_URL = "认证URL"
AUTH_TRUST_HOST = true
```

### 第三方服务（按需配置）
- Google/Github OAuth
- Google Analytics
- 支付服务（Stripe）
- 存储服务（AWS S3）
- 邮件服务

## 部署流程概览

### [1. 部署到 Vercel](./vercel.md)
最简单快速的部署方式，适合大多数用户。

```bash
1. 导入 Github 仓库到 Vercel
2. 配置环境变量
3. 一键部署
```

### [2. 部署到 Cloudflare](./cloudflare.md)
适合需要边缘计算和更高免费额度的用户。

```bash
1. 使用 cloudflare 分支
2. 配置 wrangler.toml
3. 运行 npm run cf:deploy
```

### [3. 使用 Dokploy 部署](./dokploy.md)
适合需要完全控制和自托管的用户。

```bash
1. 安装 Dokploy 服务
2. 创建项目并连接 Github
3. 配置环境变量并部署
```

## 部署后检查清单

✅ 网站可以正常访问  
✅ 数据库连接正常  
✅ 用户可以正常登录  
✅ 支付功能正常（如已配置）  
✅ 自定义域名已绑定  
✅ HTTPS 证书已配置  

## 常见问题

### 1. 环境变量未生效
- 确保环境变量名称和格式正确
- 部署平台可能需要重新部署才能应用新的环境变量

### 2. 数据库连接失败
- 检查 DATABASE_URL 是否正确
- 确保数据库允许从部署平台的 IP 访问

### 3. 认证失败
- AUTH_SECRET 必须是随机生成的安全密钥
- AUTH_URL 必须与实际部署的 URL 匹配

## 获取帮助

如果在部署过程中遇到问题，可以：
- 查看 [ShipAny 官方文档](https://docs.shipany.ai)
- 联系 ShipAny 技术支持

---
最后更新时间：2025年12月