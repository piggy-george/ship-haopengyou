# Feature 组件

Feature 组件用于展示产品或服务的关键特性，通过网格布局清晰地展示多个功能点。

## 组件导入

```tsx
import Feature from "@/components/blocks/feature";
import { Feature as FeatureType } from "@/types/blocks/feature";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 Feature 数据
  const feature: FeatureType = {
    title: "Key Features of ShipAny",
    description: "Everything you need to launch your AI SaaS startup quickly and efficiently.",
    items: [
      {
        title: "Next.js Boilerplate",
        description: "Production-ready Next.js templates with SEO-friendly structure and i18n support.",
        icon: "Sparkles"
      },
      // ...其他特性
    ],
  };

  return (
    <>
      <Feature feature={feature} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
import { Image } from "@/types/blocks/image";

export interface FeatureItem {
  title: string;        // 特性标题
  description: string;  // 特性描述
  icon?: string;       // 图标名称
  image?: Image;       // 或使用图片
}

export interface Feature {
  title: string;          // 特性区块标题
  description: string;    // 特性区块描述
  items: FeatureItem[];   // 特性项目数组
}
```

## 参数说明

### Feature 主组件
- **title**: 必填，特性区块的主标题
- **description**: 必填，特性区块的描述文本
- **items**: 必填，特性项目数组

### FeatureItem 子项
- **title**: 必填，单个特性的标题
- **description**: 必填，单个特性的详细描述
- **icon** (可选): 使用图标名称（如 "Sparkles"）
- **image** (可选): 使用自定义图片替代图标

## 特点

1. **灵活展示**: 支持图标或图片两种视觉元素
2. **网格布局**: 自动适应的响应式网格布局
3. **清晰层次**: 主标题、描述和多个特性项的清晰信息层级
4. **图标系统**: 内置图标库，通过名称即可使用
5. **易于扩展**: 可轻松添加或删除特性项

## 常用图标

组件支持多种预设图标，常用的包括：
- "Sparkles" - 闪光/创新
- "Zap" - 闪电/快速
- "Shield" - 盾牌/安全
- "Globe" - 地球/全球化
- "Code" - 代码/开发
- "Database" - 数据库
- "Users" - 用户/团队
- "Settings" - 设置/配置

## 最佳实践

1. **标题简洁**: 特性标题控制在 2-5 个词
2. **描述具体**: 描述应说明具体价值，避免空泛
3. **数量适中**: 建议展示 3-9 个特性，保持页面平衡
4. **图标匹配**: 选择与特性内容相符的图标
5. **并行结构**: 各特性项的描述保持相似的语法结构