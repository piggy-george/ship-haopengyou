# Pricing 组件

Pricing 组件用于展示产品的定价方案，通过清晰的价格层级和功能对比帮助用户选择合适的套餐。

## 组件导入

```tsx
import Pricing from "@/components/blocks/pricing";
import { Pricing as PricingType } from "@/types/blocks/pricing";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 Pricing 数据
  const pricing: PricingType = {
    title: "Simple, Transparent Pricing",
    description: "Choose the perfect plan for your needs. Always flexible to scale.",
    plans: [
      {
        name: "Starter",
        price: "$9",
        period: "/month",
        description: "Perfect for individuals and small projects",
        features: [
          "Up to 3 projects",
          "1,000 API requests/month",
          "Basic analytics",
          "Email support",
          "Community access"
        ],
        cta: {
          text: "Start Free Trial",
          href: "/signup?plan=starter",
          variant: "outline"
        },
        popular: false
      },
      {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "Best for growing businesses and teams",
        features: [
          "Unlimited projects",
          "100,000 API requests/month",
          "Advanced analytics",
          "Priority support",
          "Team collaboration",
          "Custom integrations",
          "99.9% SLA"
        ],
        cta: {
          text: "Start Free Trial",
          href: "/signup?plan=pro",
          variant: "primary"
        },
        popular: true,
        badge: "Most Popular"
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For large-scale applications and organizations",
        features: [
          "Everything in Pro",
          "Unlimited API requests",
          "Dedicated support",
          "Custom contracts",
          "SSO/SAML",
          "Advanced security",
          "Custom SLA"
        ],
        cta: {
          text: "Contact Sales",
          href: "/contact-sales",
          variant: "outline"
        },
        popular: false
      }
    ]
  };

  return (
    <>
      <Pricing pricing={pricing} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义（推测）

```typescript
export interface PricingPlan {
  name: string;           // 套餐名称
  price: string;          // 价格（可以是数字或 "Custom"）
  period?: string;        // 计费周期（如 "/month", "/year"）
  description?: string;   // 套餐描述
  features: string[];     // 功能列表
  cta: {                 // 行动按钮
    text: string;
    href: string;
    variant?: 'primary' | 'outline' | 'secondary';
  };
  popular?: boolean;      // 是否为推荐套餐
  badge?: string;         // 标签文字（如 "Most Popular"）
}

export interface Pricing {
  disabled?: boolean;      // 是否禁用
  title?: string;         // 定价区块标题
  description?: string;   // 定价区块描述
  plans: PricingPlan[];   // 定价方案数组
  currency?: string;      // 货币符号
  billing?: 'monthly' | 'yearly'; // 默认计费周期
  className?: string;     // 自定义样式类名
}
```

## 参数说明

### Pricing 主组件
- **disabled** (可选): 控制组件是否禁用
- **title** (可选): 定价区块的标题
- **description** (可选): 定价区块的描述
- **plans**: 必填，定价方案数组
- **currency** (可选): 货币符号，默认为 "$"
- **billing** (可选): 默认显示的计费周期
- **className** (可选): 自定义样式类名

### PricingPlan 子项
- **name**: 必填，套餐名称
- **price**: 必填，价格显示（支持自定义文本）
- **period** (可选): 计费周期说明
- **description** (可选): 套餐的简短描述
- **features**: 必填，包含的功能列表
- **cta**: 必填，行动按钮配置
- **popular** (可选): 是否为推荐套餐
- **badge** (可选): 显示的标签文字

## 特点

1. **视觉层次**: 通过推荐标签和样式突出最佳选择
2. **灵活定价**: 支持固定价格和自定义定价
3. **功能对比**: 清晰展示各套餐的功能差异
4. **响应式布局**: 自适应不同屏幕尺寸
5. **行动导向**: 明确的 CTA 按钮引导转化
6. **计费切换**: 支持月付/年付切换（可选）

## 最佳实践

1. **套餐数量**: 通常 3 个套餐最优（少而精）
2. **命名清晰**: 使用易懂的套餐名称（Starter, Pro, Enterprise）
3. **价值递进**: 功能和价格形成清晰的价值阶梯
4. **突出推荐**: 标记最受欢迎或性价比最高的套餐
5. **功能描述**: 使用简洁、用户友好的功能说明
6. **价格透明**: 明确显示所有费用，避免隐藏成本

## 心理学原则

- **锚定效应**: 高价套餐让中间套餐显得更有价值
- **选择悖论**: 限制选项数量减少决策疲劳
- **社会证明**: "Most Popular" 标签利用从众心理
- **损失厌恶**: 突出升级后获得的功能

## 自定义建议

- 可以添加年付折扣提示
- 考虑添加退款保证说明
- 可以集成限时优惠倒计时
- 支持货币切换功能
- 添加功能对比表格视图选项