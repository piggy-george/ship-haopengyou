# Header 组件

Header 组件用于创建网站的顶部导航栏，包含 Logo、导航菜单和操作按钮。

## 组件导入

```tsx
import Header from "@/components/blocks/header";
import { Header as HeaderType } from "@/types/blocks/header";
```

## 使用示例

```tsx
export default function Page() {
  // 自定义 header 数据
  const header: HeaderType = {
    logo: {
      title: "ShipAny",
      image: {
        src: "/logo.png",
        alt: "ShipAny",
      },
    },
    nav: {
      items: [
        {
          title: "Features",
          href: "/features",
        },
        {
          title: "Pricing",
          href: "/pricing",
        },
        {
          title: "Showcases",
          children: [
            {
              title: "Showcase 1",
              href: "/showcase/1",
            },
            {
              title: "Showcase 2",
              href: "/showcase/2",
            },
          ],
        },
      ],
    },
    buttons: [
      {
        title: "Sign In",
        variant: "primary",
        href: "/auth/signin",
      },
    ],
  };

  return (
    <>
      <Header header={header} />
      {/* ...其他组件 */}
    </>
  );
}
```

## 类型定义

```typescript
export interface Header {
  disabled?: boolean;      // 是否禁用
  logo?: Logo;            // Logo 配置
  nav?: Nav;              // 导航菜单配置
  buttons?: Button[];     // 按钮配置
  className?: string;     // 自定义样式类名
}
```

## 参数说明

- **disabled** (可选): 控制 Header 组件是否禁用
- **logo** (可选): Logo 配置对象，包含标题和图片
- **nav** (可选): 导航菜单配置，支持多级菜单（通过 children 属性）
- **buttons** (可选): 按钮数组，可配置多个操作按钮
- **className** (可选): 自定义 CSS 类名，用于样式覆盖

## 特点

1. **响应式设计**: 自动适应不同屏幕尺寸
2. **多级菜单支持**: 支持下拉子菜单
3. **灵活配置**: 所有元素都是可选的，可根据需要自由组合
4. **样式可定制**: 通过 className 支持自定义样式