# 管理后台布局

## 概述

ShipAny 使用 `DashboardLayout` 组件提供统一的管理后台布局，支持灵活的侧边栏配置。

## 布局结构

### 主要组件
1. **品牌区域**：Logo 和标题
2. **导航菜单**：支持多级菜单
3. **社交链接**：可选的外部链接
4. **内容区域**：页面主体内容

## 实现示例

```typescript
import { DashboardLayout } from "@/components/dashboard/layout";
import { Sidebar } from "@/types/sidebar";
import { redirect } from "next/navigation";
import { getUserInfo } from "@/models/user";

export default async function ({ children }: { children: ReactNode }) {
  // 验证用户权限
  const userInfo = await getUserInfo();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  
  if (!userInfo || !adminEmails.includes(userInfo.email)) {
    redirect("/");
  }

  // 配置侧边栏
  const sidebar: Sidebar = {
    brand: {
      title: "ShipAny",
      logo: {
        src: "/logo.png",
        alt: "ShipAny",
      },
    },
    nav: {
      items: [
        {
          title: "用户管理",
          url: "/admin/users",
          icon: "RiUserLine",
        },
        {
          title: "订单管理",
          is_expand: true,
          icon: "RiShoppingBagLine",
          children: [
            {
              title: "付费订单",
              url: "/admin/paid-orders",
            },
            {
              title: "退款管理",
              url: "/admin/refunds",
            },
          ],
        },
      ],
    },
    social: {
      items: [
        {
          title: "GitHub",
          url: "https://github.com/shipany",
          icon: "RiGithubFill",
        },
      ],
    },
  };

  return <DashboardLayout sidebar={sidebar}>{children}</DashboardLayout>;
}
```

## 侧边栏配置详解

### 品牌配置
```typescript
brand: {
  title: string;           // 显示的标题
  logo?: {
    src: string;          // Logo 图片路径
    alt: string;          // Logo 替代文本
  };
}
```

### 导航菜单配置
```typescript
nav: {
  items: Array<{
    title: string;         // 菜单标题
    url?: string;         // 链接地址
    icon?: string;        // 图标名称（使用 Remix Icon）
    is_active?: boolean;  // 是否高亮
    is_expand?: boolean;  // 是否默认展开
    children?: Array<{    // 子菜单
      title: string;
      url: string;
      icon?: string;
    }>;
  }>;
}
```

### 社交链接配置
```typescript
social?: {
  items: Array<{
    title: string;        // 链接标题
    url: string;         // 外部链接
    icon: string;        // 图标名称
  }>;
}
```

## 高级功能

### 1. 动态菜单高亮
根据当前路径自动高亮对应的菜单项：

```typescript
const currentPath = request.url.pathname;
const menuItems = sidebar.nav.items.map(item => ({
  ...item,
  is_active: item.url === currentPath,
}));
```

### 2. 权限控制菜单
根据用户权限动态显示菜单项：

```typescript
const menuItems = [];

if (hasPermission("user:read")) {
  menuItems.push({
    title: "用户管理",
    url: "/admin/users",
  });
}

if (hasPermission("order:read")) {
  menuItems.push({
    title: "订单管理",
    url: "/admin/orders",
  });
}
```

### 3. 多级菜单
支持无限层级的菜单嵌套：

```typescript
{
  title: "系统管理",
  is_expand: true,
  children: [
    {
      title: "配置管理",
      url: "/admin/settings",
    },
    {
      title: "日志管理",
      is_expand: false,
      children: [
        {
          title: "操作日志",
          url: "/admin/logs/operation",
        },
        {
          title: "错误日志",
          url: "/admin/logs/error",
        },
      ],
    },
  ],
}
```

## 最佳实践

1. **图标使用**
   - 使用 Remix Icon 图标库
   - 图标名称格式：`Ri[图标名]Line` 或 `Ri[图标名]Fill`
   - 示例：`RiUserLine`, `RiSettingsFill`

2. **菜单组织**
   - 相关功能归类到同一父菜单下
   - 常用功能放在顶部
   - 使用清晰的菜单标题

3. **响应式设计**
   - DashboardLayout 已内置响应式支持
   - 移动端会自动切换为抽屉式菜单

4. **性能优化**
   - 使用服务端组件进行权限验证
   - 避免在客户端进行敏感权限判断