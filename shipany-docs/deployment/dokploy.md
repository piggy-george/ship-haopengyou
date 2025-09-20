# 使用 Dokploy 部署

ShipAny 支持使用 Dokploy 部署。

## 前置准备

1. **安装 Dokploy 服务**  
   在此之前，你需要按照 [Dokploy 官方文档](https://docs.dokploy.com/docs/core)的说明，在你的服务器安装 Dokploy 服务。

2. **准备代码仓库**  
   你需要先按照[快速开始](https://docs.shipany.ai/zh)的步骤，在本地拉取 shipany-template-one 模板代码，修改好后上传到你自己的 Github 仓库。

## 部署流程

### 1. 在 Dokploy 管理后台创建项目
在 Dokploy 管理后台创建一个新项目。

### 2. 绑定 Github 仓库
进入项目，绑定你的 Github 账号，选择基于 shipany-template-one 模板创建的仓库，保存配置。

### 3. 配置构建信息
继续配置，填写构建信息，点击保存。

### 4. 设置环境变量
把项目 `.env.production` 文件中的内容，复制粘贴到 Environment，设置环境变量。

### 5. 部署项目
点击部署按钮，等待部署完成。

### 6. 配置域名
进入 Domains 页面，绑定自定义域名。

### 7. DNS 解析
DNS 解析域名到你的 Dokploy 服务器公网 IP，等到解析生效，打开域名即可访问你的网站。

## 注意事项

1. **服务器要求**：需要先在服务器上安装 Dokploy 服务
2. **代码仓库**：必须先将 ShipAny 代码上传到 Github 私有仓库
3. **环境变量**：确保将 `.env.production` 中的所有环境变量都正确配置到 Dokploy 中
4. **域名解析**：DNS 解析需要一定时间生效，请耐心等待

## Dokploy 部署优势

- **自托管**：在自己的服务器上部署，完全掌控数据
- **Docker 容器化**：基于 Docker 的部署方式，更加灵活和稳定
- **持续部署**：支持 Git 推送自动部署
- **多项目管理**：可以在同一个 Dokploy 实例上管理多个项目

## 环境变量配置

与其他部署方式一样，需要配置以下主要环境变量：

- 数据库连接（DATABASE_URL）
- 认证配置（AUTH_SECRET, AUTH_URL）
- 第三方服务 API 密钥
- 存储配置
- 支付配置等

具体的环境变量列表请参考项目根目录的 `.env.example` 文件。

## 参考资料

- [Dokploy 官方文档](https://docs.dokploy.com/docs/core)
- [ShipAny 快速开始指南](https://docs.shipany.ai/zh)

---
最后更新时间：2025年6月11日