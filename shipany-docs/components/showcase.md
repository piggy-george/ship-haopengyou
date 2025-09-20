# Showcase 组件

Showcase 组件用于展示产品案例、客户项目或应用示例，通过视觉化的方式展现产品的实际应用场景。

## 组件导入

```tsx
import Showcase from "@/components/blocks/showcase";
import { Showcase as ShowcaseType } from "@/types/blocks/showcase";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 Showcase 数据
  const showcase: ShowcaseType = {
    title: "Successful Projects Built with ShipAny",
    description: "Discover amazing applications created by our community using ShipAny.",
    items: [
      {
        title: "AI Writing Assistant",
        description: "A powerful AI-powered writing tool that helps users create content efficiently.",
        image: {
          src: "/showcase/ai-writer.png",
          alt: "AI Writing Assistant Screenshot"
        },
        link: "https://example.com/ai-writer",
        tags: ["AI", "SaaS", "Writing"]
      },
      {
        title: "Analytics Dashboard",
        description: "Real-time analytics platform for tracking business metrics and KPIs.",
        image: {
          src: "/showcase/analytics.png",
          alt: "Analytics Dashboard"
        },
        link: "https://example.com/analytics",
        tags: ["Analytics", "B2B", "Data"]
      },
      // ...更多案例
    ]
  };

  return (
    <>
      <Showcase showcase={showcase} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义（推测）

```typescript
import { Image } from "@/types/blocks/image";

export interface ShowcaseItem {
  title: string;          // 项目标题
  description: string;    // 项目描述
  image: Image;          // 项目截图或预览图
  link?: string;         // 项目链接
  tags?: string[];       // 项目标签
  featured?: boolean;    // 是否为精选项目
}

export interface Showcase {
  disabled?: boolean;         // 是否禁用
  title?: string;            // 展示区块标题
  description?: string;      // 展示区块描述
  items: ShowcaseItem[];     // 展示项目数组
  layout?: 'grid' | 'list'; // 布局方式
  className?: string;        // 自定义样式类名
}
```

## 参数说明

### Showcase 主组件
- **disabled** (可选): 控制组件是否禁用
- **title** (可选): 展示区块的标题
- **description** (可选): 展示区块的描述
- **items**: 必填，展示项目的数组
- **layout** (可选): 布局方式，网格或列表视图
- **className** (可选): 自定义样式类名

### ShowcaseItem 子项
- **title**: 必填，项目名称
- **description**: 必填，项目简介
- **image**: 必填，项目预览图
- **link** (可选): 项目的外部链接
- **tags** (可选): 项目标签，用于分类
- **featured** (可选): 标记为精选项目

## 特点

1. **视觉吸引**: 通过高质量的预览图展示实际应用
2. **灵活布局**: 支持网格和列表两种展示方式
3. **标签系统**: 通过标签对项目进行分类
4. **链接跳转**: 可直接访问实际项目
5. **精选展示**: 支持突出展示重要案例
6. **响应式设计**: 自适应不同设备屏幕

## 最佳实践

1. **高质量图片**: 使用清晰、专业的项目截图
2. **简洁描述**: 用一两句话说明项目的核心价值
3. **相关标签**: 使用准确的标签帮助用户筛选
4. **案例多样性**: 展示不同行业和应用场景的案例
5. **定期更新**: 保持案例的时效性和相关性
6. **用户故事**: 如果可能，包含客户的成功故事

## 应用场景

- **产品主页**: 展示成功客户案例
- **模板库**: 展示可用的项目模板
- **作品集**: 展示开发团队的项目经验
- **行业解决方案**: 按行业分类展示应用案例
- **用户社区**: 展示社区成员创建的项目