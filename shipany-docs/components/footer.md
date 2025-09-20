# Footer 组件

Footer 组件是网站的页脚部分，包含重要链接、公司信息、社交媒体链接等，为用户提供网站导航和额外信息。

## 组件导入

```tsx
import Footer from "@/components/blocks/footer";
import { Footer as FooterType } from "@/types/blocks/footer";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 Footer 数据
  const footer: FooterType = {
    logo: {
      title: "ShipAny",
      image: {
        src: "/logo.png",
        alt: "ShipAny Logo"
      }
    },
    description: "The fastest way to launch your AI SaaS startup. Built with Next.js, TypeScript, and Tailwind CSS.",
    sections: [
      {
        title: "Product",
        links: [
          { title: "Features", href: "/features" },
          { title: "Pricing", href: "/pricing" },
          { title: "Showcase", href: "/showcase" },
          { title: "Changelog", href: "/changelog" }
        ]
      },
      {
        title: "Resources",
        links: [
          { title: "Documentation", href: "/docs" },
          { title: "Blog", href: "/blog" },
          { title: "Templates", href: "/templates" },
          { title: "Support", href: "/support" }
        ]
      },
      {
        title: "Company",
        links: [
          { title: "About", href: "/about" },
          { title: "Contact", href: "/contact" },
          { title: "Privacy Policy", href: "/privacy" },
          { title: "Terms of Service", href: "/terms" }
        ]
      },
      {
        title: "Connect",
        links: [
          { title: "Twitter", href: "https://twitter.com/shipany", external: true },
          { title: "GitHub", href: "https://github.com/shipany", external: true },
          { title: "Discord", href: "https://discord.gg/shipany", external: true },
          { title: "Newsletter", href: "/newsletter" }
        ]
      }
    ],
    copyright: "© 2024 ShipAny. All rights reserved.",
    social: {
      twitter: "https://twitter.com/shipany",
      github: "https://github.com/shipany",
      discord: "https://discord.gg/shipany"
    }
  };

  return (
    <>
      <Footer footer={footer} />
    </>
  );
}
```

## 类型定义（推测）

```typescript
import { Image } from "@/types/blocks/image";

export interface FooterLink {
  title: string;      // 链接文本
  href: string;       // 链接地址
  external?: boolean; // 是否为外部链接
}

export interface FooterSection {
  title: string;        // 栏目标题
  links: FooterLink[];  // 链接列表
}

export interface FooterSocial {
  twitter?: string;   // Twitter 链接
  github?: string;    // GitHub 链接
  discord?: string;   // Discord 链接
  linkedin?: string;  // LinkedIn 链接
  facebook?: string;  // Facebook 链接
  youtube?: string;   // YouTube 链接
}

export interface Footer {
  disabled?: boolean;         // 是否禁用
  logo?: {                   // Logo 配置
    title?: string;
    image?: Image;
  };
  description?: string;       // 公司/产品描述
  sections?: FooterSection[]; // 链接栏目
  copyright?: string;         // 版权信息
  social?: FooterSocial;      // 社交媒体链接
  className?: string;         // 自定义样式类名
}
```

## 参数说明

### Footer 主组件
- **disabled** (可选): 控制组件是否禁用
- **logo** (可选): 底部 Logo 配置
- **description** (可选): 公司或产品的简短描述
- **sections** (可选): 链接栏目数组
- **copyright** (可选): 版权声明文本
- **social** (可选): 社交媒体链接配置
- **className** (可选): 自定义样式类名

### FooterSection 栏目
- **title**: 栏目标题（如 "Product", "Resources"）
- **links**: 该栏目下的链接列表

### FooterLink 链接
- **title**: 链接显示文本
- **href**: 链接地址
- **external** (可选): 标记外部链接，会在新窗口打开

## 特点

1. **信息架构**: 清晰的分栏组织信息
2. **导航功能**: 提供网站地图式的导航
3. **品牌展示**: Logo 和描述强化品牌形象
4. **社交连接**: 集成社交媒体链接
5. **法律合规**: 包含必要的法律页面链接
6. **响应式设计**: 移动端自动调整布局

## 内容组织建议

### 常见栏目分类

1. **产品相关**
   - 功能特性
   - 定价方案
   - 产品更新
   - 客户案例

2. **资源中心**
   - 文档中心
   - 博客文章
   - 教程指南
   - API 文档

3. **公司信息**
   - 关于我们
   - 团队介绍
   - 联系方式
   - 招聘信息

4. **法律条款**
   - 隐私政策
   - 服务条款
   - Cookie 政策
   - 退款政策

5. **社区支持**
   - 帮助中心
   - 社区论坛
   - 客户支持
   - 状态页面

## 设计最佳实践

1. **层次清晰**: 使用不同的字体大小区分标题和链接
2. **间距适当**: 确保链接之间有足够的点击空间
3. **颜色对比**: 链接颜色要有足够的对比度
4. **hover 效果**: 为链接添加悬停效果提升交互感
5. **移动适配**: 小屏幕上可能需要折叠或重新排列

## SEO 优化

- 使用语义化的 HTML 标签（`<footer>`, `<nav>`）
- 为外部链接添加 `rel="noopener noreferrer"`
- 确保所有链接都是可访问的
- 包含网站地图链接有助于搜索引擎索引

## 无障碍性

- 使用适当的 ARIA 标签
- 确保键盘可导航
- 为社交媒体图标提供文字说明
- 保持良好的颜色对比度

## 版权声明示例

```
© 2024 ShipAny. All rights reserved.
© 2024 [Company Name]. Made with ❤️ in [Location]
Copyright © 2024 [Company]. All rights reserved. 
```

## 社交媒体整合

推荐包含的社交平台：
- **技术产品**: GitHub, Twitter, Discord
- **B2B 产品**: LinkedIn, Twitter, YouTube
- **B2C 产品**: Facebook, Instagram, Twitter
- **内容产品**: YouTube, Twitter, Newsletter