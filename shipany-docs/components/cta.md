# CTA 组件

CTA（Call to Action）组件用于在页面关键位置引导用户采取行动，是转化优化的核心元素。

## 组件导入

```tsx
import CTA from "@/components/blocks/cta";
import { CTA as CTAType } from "@/types/blocks/cta";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 CTA 数据
  const cta: CTAType = {
    title: "Ship your first AI SaaS Startup",
    description: "Start from here, with ShipAny.",
    buttons: [
      {
        title: "Get ShipAny",
        url: "/#pricing"
      }
    ]
  }

  return (
    <>
      <CTA cta={cta} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
import { Button } from "@/types/blocks/button";

export interface CTA {
  disabled?: boolean;    // 是否禁用
  title?: string;       // 标题文本
  description?: string; // 描述文本
  buttons?: Button[];   // 按钮数组
}
```

## 参数说明

- **disabled** (可选): 控制组件是否禁用
- **title** (可选): CTA 的主标题，应简洁有力
- **description** (可选): 补充说明文本，提供更多上下文
- **buttons** (可选): 行动按钮数组，支持多个按钮

## 特点

1. **视觉突出**: 通过设计和位置吸引用户注意力
2. **行动导向**: 明确的行动召唤和按钮
3. **简洁有力**: 文案精炼，直击要点
4. **灵活配置**: 支持单按钮或多按钮布局
5. **响应式设计**: 在各种设备上保持良好展示

## CTA 文案最佳实践

### 标题撰写原则
1. **动词开头**: "Start", "Get", "Join", "Discover"
2. **价值导向**: 强调用户获得的价值
3. **紧迫感**: 适当营造时间或数量限制
4. **简短有力**: 控制在 5-10 个词以内

### 标题示例
- ✅ "Launch Your AI Startup Today"
- ✅ "Get Started in 5 Minutes"
- ✅ "Join 1000+ Successful Founders"
- ❌ "Click Here" （太泛泛）
- ❌ "Submit" （缺乏吸引力）

### 描述文案技巧
- 提供额外的价值说明
- 消除用户疑虑
- 强化行动理由
- 保持简洁，1-2 句话

## 按钮设计建议

### 按钮文案
- **具体明确**: "Start Free Trial" 好于 "Try Now"
- **第一人称**: "Get My Template" 好于 "Get Template"
- **行动导向**: 使用动词，避免名词

### 按钮样式
- **主按钮**: 使用品牌主色，视觉最突出
- **次按钮**: outline 或 ghost 样式
- **大小适中**: 确保移动端易于点击

## 放置位置策略

1. **页面顶部**: Hero 区域后的第一个转化点
2. **内容中间**: 在展示价值后适时引导
3. **页面底部**: 给浏览完整页的用户最后机会
4. **浮动/固定**: 始终可见的转化入口

## 心理学应用

### 1. 稀缺性原理
```tsx
const cta = {
  title: "Limited Time Offer - 50% OFF",
  description: "Only 48 hours left. Don't miss out!",
  // ...
}
```

### 2. 社会证明
```tsx
const cta = {
  title: "Join 10,000+ Developers",
  description: "Start building with the most trusted boilerplate",
  // ...
}
```

### 3. 零风险承诺
```tsx
const cta = {
  title: "Try Risk-Free for 30 Days",
  description: "100% money-back guarantee. No questions asked.",
  // ...
}
```

## 多按钮策略

当使用多个按钮时：

```tsx
const cta = {
  title: "Ready to Get Started?",
  description: "Choose the option that works best for you",
  buttons: [
    {
      title: "Start Free Trial",
      url: "/signup",
      variant: "primary"
    },
    {
      title: "Book a Demo",
      url: "/demo",
      variant: "outline"
    }
  ]
}
```

## A/B 测试建议

常见的 CTA 测试变量：
- 标题文案
- 按钮文字
- 按钮颜色
- CTA 位置
- 紧迫性元素
- 价值主张表述

## 移动端优化

- 确保按钮足够大（最小 44x44 像素）
- 文字在小屏幕上清晰可读
- 避免过长的描述文本
- 考虑使用粘性 CTA 栏