# Hero 组件

Hero 组件是网站的主视觉区域，通常位于页面顶部，用于展示核心价值主张、吸引用户注意力并引导用户行动。

## 组件导入

```tsx
import Hero from "@/components/blocks/hero";
import { Hero as HeroType } from "@/types/blocks/hero";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 hero 数据
  const hero: HeroType = {
    title: "Ship Any AI Startups in hours, not days",
    highlight_text: "Ship Any",
    description: "ShipAny is a NextJS boilerplate for building AI SaaS startups.<br/>Ship Fast with a variety of templates and components.",
    announcement: {
      title: "🎉 Happy New Year",
      url: "/#pricing",
    },
    buttons: [
      {
        title: "Get ShipAny",
        url: "/ai-podcast-generator",
      },
    ],
    show_happy_users: true,
  };

  return (
    <>
      <Hero hero={hero} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
export interface Hero {
  disabled?: boolean;           // 是否禁用
  title?: string;              // 主标题
  highlight_text?: string;     // 高亮文本
  description?: string;        // 描述文本（支持 HTML）
  buttons?: Button[];          // 按钮数组
  image?: Image;               // 背景图片
  announcement?: Announcement; // 公告横幅
  show_happy_users?: boolean;  // 是否显示快乐用户
}
```

## 参数说明

- **disabled** (可选): 控制 Hero 组件是否禁用
- **title** (可选): 主标题文本
- **highlight_text** (可选): 在标题中需要高亮显示的文本部分
- **description** (可选): 详细描述文本，支持 HTML 格式（如换行 `<br/>`）
- **buttons** (可选): 操作按钮数组，可配置多个 CTA 按钮
- **image** (可选): 背景图片配置
- **announcement** (可选): 顶部公告栏配置，包含标题和链接
- **show_happy_users** (可选): 是否显示"快乐用户"社交证明元素

## 特点

1. **吸引力设计**: 大标题和突出的 CTA 按钮，快速传达价值主张
2. **文本高亮**: 支持标题中特定文字的高亮显示
3. **公告功能**: 顶部公告栏用于展示重要通知或活动
4. **社交证明**: 可选的"快乐用户"展示，增强信任度
5. **HTML 支持**: 描述文本支持基本的 HTML 标记
6. **响应式布局**: 自适应不同设备屏幕尺寸

## 自定义建议

- 标题应简洁有力，直接传达产品核心价值
- 高亮文本通常为品牌名称或关键特性
- 描述文本控制在 2-3 行以内，保持简洁
- CTA 按钮文案要有行动导向性
- 公告栏适合展示限时优惠或新功能发布