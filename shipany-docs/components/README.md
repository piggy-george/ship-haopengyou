# ShipAny 组件文档汇总

本目录包含了 ShipAny 提供的所有页面组件的详细文档。这些组件是构建现代化 SaaS 网站的基础模块。

## 组件列表

### 1. [Header](./header.md)
顶部导航栏组件，包含 Logo、导航菜单和操作按钮。

**主要特性**：
- 响应式导航菜单
- 多级下拉菜单支持
- 灵活的按钮配置
- 移动端自适应

### 2. [Hero](./hero.md)
主视觉区域组件，用于展示核心价值主张和引导用户行动。

**主要特性**：
- 醒目的标题和描述
- 文本高亮功能
- 顶部公告栏
- CTA 按钮组
- 社交证明元素

### 3. [Feature](./feature.md)
功能展示组件，通过网格布局展示产品的关键特性。

**主要特性**：
- 图标/图片展示
- 响应式网格布局
- 清晰的信息层级
- 内置图标系统

### 4. [Showcase](./showcase.md)
案例展示组件，展示产品的实际应用案例或客户项目。

**主要特性**：
- 项目预览图展示
- 标签分类系统
- 外部链接支持
- 精选项目标记

### 5. [Pricing](./pricing.md)
定价方案组件，清晰展示不同的价格层级和功能对比。

**主要特性**：
- 多套餐对比
- 推荐套餐标记
- 灵活的定价显示
- 清晰的功能列表

### 6. [Testimonial](./testimonial.md)
用户推荐组件，通过真实用户反馈建立信任。

**主要特性**：
- 用户头像展示
- 职位和公司信息
- 真实评价内容
- 多种布局方式

### 7. [FAQ](./faq.md)
常见问题组件，帮助用户快速找到答案。

**主要特性**：
- 折叠式问答设计
- 平滑展开动画
- SEO 友好结构
- 分组组织支持

### 8. [CTA](./cta.md)
行动召唤组件，在关键位置引导用户转化。

**主要特性**：
- 突出的视觉设计
- 灵活的按钮配置
- 紧迫感营造
- 多按钮支持

### 9. [Footer](./footer.md)
页脚组件，提供网站导航和公司信息。

**主要特性**：
- 多栏链接组织
- 社交媒体集成
- 版权信息展示
- 响应式布局

## 使用指南

### 基本使用流程

1. **导入组件和类型**
```tsx
import ComponentName from "@/components/blocks/component-name";
import { ComponentType } from "@/types/blocks/component-name";
```

2. **准备组件数据**
```tsx
const componentData: ComponentType = {
  // 根据组件类型定义填充数据
};
```

3. **在页面中使用**
```tsx
<ComponentName componentProp={componentData} />
```

### 组件组合示例

典型的 Landing Page 组件组合：

```tsx
export default function LandingPage() {
  return (
    <>
      <Header header={headerData} />
      <Hero hero={heroData} />
      <Feature feature={featureData} />
      <Showcase showcase={showcaseData} />
      <Pricing pricing={pricingData} />
      <Testimonial testimonial={testimonialData} />
      <FAQ faq={faqData} />
      <CTA cta={ctaData} />
      <Footer footer={footerData} />
    </>
  );
}
```

## 自定义和扩展

### 样式自定义
大部分组件支持 `className` 属性，可以通过它添加自定义样式：

```tsx
<Component className="custom-styles" />
```

### 数据驱动
所有组件都是数据驱动的，通过修改传入的数据对象即可改变组件内容，无需修改组件代码。

### TypeScript 支持
所有组件都有完整的 TypeScript 类型定义，提供良好的开发体验和类型安全。

## 最佳实践

1. **保持一致性**：在整个网站中保持组件风格和交互的一致性
2. **响应式优先**：确保在移动设备上的良好体验
3. **性能考虑**：合理使用图片，注意加载性能
4. **SEO 友好**：使用语义化的内容结构
5. **可访问性**：确保组件符合 WCAG 标准

## 注意事项

- 某些组件（如 Showcase 和 Pricing）的详细类型定义可能需要参考实际代码
- 组件的具体样式可能会根据项目的全局样式设置而有所不同
- 建议根据实际需求对组件进行适当的调整和优化

## 更新说明

文档最后更新时间：2025年1月20日

这些文档基于 ShipAny 文档网站的内容整理，部分类型定义为推测性质，实际使用时请以项目代码为准。