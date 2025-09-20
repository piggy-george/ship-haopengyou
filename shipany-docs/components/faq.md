# FAQ 组件

FAQ（常见问题）组件用于展示用户经常提出的问题及其答案，帮助用户快速找到所需信息，减少客户支持负担。

## 组件导入

```tsx
import FAQ from "@/components/blocks/faq";
import { FAQ as FAQType } from "@/types/blocks/faq";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 FAQ 数据
  const faq: FAQType = {
    title: "FAQ",
    description: "Frequently Asked Questions About ShipAny",
    items: [
      {
        question: "What exactly is ShipAny and how does it work?",
        answer: "ShipAny is a comprehensive NextJS boilerplate designed specifically for building AI SaaS startups. It provides ready-to-use templates, infrastructure setup, and deployment tools that help you launch your AI business in hours instead of days."
      },
      // ...其他问题
    ],
  };

  return (
    <>
      <FAQ faq={faq} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
export interface FAQItem {
  question?: string;  // 问题
  answer?: string;    // 答案
}

export interface FAQ {
  disabled?: boolean;     // 是否禁用
  title?: string;        // FAQ 区块标题
  description?: string;  // FAQ 区块描述
  items?: FAQItem[];     // 问答项目数组
}
```

## 参数说明

### FAQ 主组件
- **disabled** (可选): 控制组件是否禁用
- **title** (可选): FAQ 区块的标题，通常为 "FAQ" 或 "常见问题"
- **description** (可选): FAQ 区块的描述文本
- **items** (可选): 问答项目的数组

### FAQItem 子项
- **question** (可选): 问题文本
- **answer** (可选): 答案文本，支持较长的详细说明

## 特点

1. **折叠式设计**: 默认收起，点击展开查看答案
2. **清晰层次**: 问题突出显示，答案详细展开
3. **搜索友好**: 有利于 SEO 和页面内搜索
4. **响应式布局**: 适配各种设备屏幕
5. **交互流畅**: 平滑的展开/收起动画效果

## 常见问题类型

### 1. 产品相关
- 产品是什么？如何工作？
- 主要功能和特性有哪些？
- 与竞品的区别是什么？

### 2. 定价相关
- 有免费试用吗？
- 如何计费？
- 可以随时取消吗？
- 是否有退款政策？

### 3. 技术相关
- 支持哪些技术栈？
- 如何部署？
- 是否提供技术支持？
- 如何更新升级？

### 4. 使用相关
- 如何开始使用？
- 是否有使用教程？
- 遇到问题如何解决？
- 是否支持定制开发？

## 最佳实践

1. **问题选择**: 选择真正高频的问题，而非凑数
2. **简洁明了**: 问题简短，答案详实但不冗长
3. **逻辑分组**: 相关问题归类，便于查找
4. **定期更新**: 根据用户反馈更新问题列表
5. **引导行动**: 在答案中适当引导用户下一步行动

## 撰写技巧

### 问题撰写
- ✅ 使用用户的语言和表达方式
- ✅ 直接切入要点
- ✅ 避免行业术语和缩写

### 答案撰写
- ✅ 开门见山，先给出核心答案
- ✅ 必要时提供详细解释和示例
- ✅ 使用分点或列表让答案更易读
- ✅ 适当添加相关链接引导深入了解

## 示例问答

```
Q: ShipAny 适合什么样的项目？
A: ShipAny 特别适合以下场景：
   • AI SaaS 初创项目 - 提供完整的 AI 集成模板
   • 快速原型开发 - 几天内即可上线 MVP
   • 个人开发者项目 - 一人即可搭建完整应用
   • 中小型商业项目 - 包含支付、认证等商业功能

Q: 购买后可以用于多个项目吗？
A: 是的！一次购买，终身使用。您可以：
   • 用于无限个人或商业项目
   • 修改和定制所有代码
   • 不需要在项目中标注 ShipAny
   唯一限制是不能转售源代码本身。
```

## 交互增强

- **搜索功能**: 支持在 FAQ 中搜索关键词
- **锚点链接**: 支持直接链接到特定问题
- **投票功能**: "这个答案有帮助吗？"
- **相关问题**: 展示相关的其他问题
- **联系支持**: 找不到答案时的联系入口