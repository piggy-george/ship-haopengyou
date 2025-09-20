# Testimonial 组件

Testimonial 组件用于展示用户评价和推荐，通过真实的用户反馈建立信任和社会证明。

## 组件导入

```tsx
import Testimonial from "@/components/blocks/testimonial";
import { Testimonial as TestimonialType } from "@/types/blocks/testimonial";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 Testimonial 数据
  const testimonial: TestimonialType = {
    title: "What Users Say About ShipAny",
    description: "Hear from developers and founders who launched their AI startups with ShipAny.",
    items: [
      {
        avatar: {
          src: "/imgs/user/1.png"
        },
        name: "David Chen",
        title: "Founder of AIWallpaper.shop",
        comment: "ShipAny saved us months of development time. We launched our AI wallpaper business in just 2 days and got our first paying customer within a week!"
      },
      // ...其他推荐
    ],
  };

  return (
    <>
      <Testimonial testimonial={testimonial} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
import { Image } from "@/types/blocks/image";

export interface TestimonialItem {
  avatar?: Image;    // 用户头像
  name?: string;     // 用户名称
  title?: string;    // 用户职位或公司
  comment?: string;  // 评价内容
}

export interface Testimonial {
  disabled?: boolean;           // 是否禁用
  title?: string;              // 推荐区块标题
  description?: string;        // 推荐区块描述
  items?: TestimonialItem[];   // 推荐项目数组
}
```

## 参数说明

### Testimonial 主组件
- **disabled** (可选): 控制组件是否禁用
- **title** (可选): 推荐区块的标题
- **description** (可选): 推荐区块的描述文本
- **items** (可选): 用户推荐项目的数组

### TestimonialItem 子项
- **avatar** (可选): 用户头像图片配置
- **name** (可选): 用户姓名
- **title** (可选): 用户的职位、公司或身份标识
- **comment** (可选): 用户的评价内容

## 特点

1. **社会证明**: 通过真实用户反馈建立信任
2. **视觉吸引**: 用户头像让推荐更加真实可信
3. **灵活布局**: 支持网格或轮播展示方式
4. **响应式设计**: 自适应不同设备屏幕
5. **内容丰富**: 包含完整的用户信息和评价

## 最佳实践

1. **真实性**: 使用真实的用户反馈，避免虚构
2. **具体化**: 评价应包含具体的成果和数据
3. **多样性**: 展示不同行业、规模的用户案例
4. **更新性**: 定期更新，保持内容的时效性
5. **相关性**: 选择目标用户群体相关的推荐
6. **适度展示**: 3-6 个推荐通常效果最佳

## 内容建议

### 好的评价示例
- ✅ "使用 ShipAny 2天内上线，一周内获得首个付费客户"
- ✅ "相比自己开发，节省了3个月时间和5万元成本"
- ✅ "模板质量很高，扩展性强，已经基于它开发了3个项目"

### 避免的内容
- ❌ "非常好用"（太空泛）
- ❌ "最好的模板"（缺乏具体性）
- ❌ "推荐！"（没有实质内容）

## 设计变体

1. **卡片式**: 每个推荐独立卡片展示
2. **引用式**: 大号引用样式，突出评价内容
3. **轮播式**: 适合展示更多推荐内容
4. **视频式**: 包含用户视频推荐
5. **星级评分**: 添加评分展示

## 心理学应用

- **从众效应**: 他人的正面评价影响购买决策
- **相似性原则**: 展示相似背景用户增强认同感
- **具体性效应**: 具体数据比抽象描述更有说服力
- **近因效应**: 最新的评价更容易被记住