# 用户控制台

## 概述

用户控制台是 ShipAny 为普通用户提供的个人管理界面，用户可以在这里管理个人信息、查看订单、管理积分和 API 密钥等。

## 访问方式

用户登录后，点击右上角的用户头像即可进入控制台。

## 控制台布局

### 实现示例

```typescript
import { ConsoleLayout } from "@/components/console/layout";
import { Sidebar } from "@/types/sidebar";
import { redirect } from "next/navigation";
import { getUserInfo } from "@/models/user";
import { t } from "@/i18n";

export default async function ({ children }: { children: ReactNode }) {
  // 验证用户登录状态
  const userInfo = await getUserInfo();
  if (!userInfo || !userInfo.email) {
    redirect("/auth/signin");
  }

  // 配置侧边栏
  const sidebar: Sidebar = {
    nav: {
      items: [
        {
          title: t("user.my_orders"),
          url: "/my-orders",
          icon: "RiOrderPlayLine",
          is_active: true,
        },
        {
          title: t("user.credits"),
          url: "/console/credits",
          icon: "RiCoinLine",
        },
        {
          title: t("user.api_keys"),
          url: "/console/api-keys",
          icon: "RiKeyLine",
        },
        {
          title: t("user.profile"),
          url: "/console/profile",
          icon: "RiUserLine",
        },
      ],
    },
  };

  return <ConsoleLayout sidebar={sidebar}>{children}</ConsoleLayout>;
}
```

## 主要功能模块

### 1. 我的订单

用户可以查看自己的所有订单记录：

```typescript
// pages/my-orders.tsx
import { TableSlot } from "@/components/console/table/table-slot";
import { getOrdersByUser } from "@/models/order";
import { getUserInfo } from "@/models/user";

export default async function MyOrders() {
  const userInfo = await getUserInfo();
  const orders = await getOrdersByUser(userInfo.uuid);
  
  const columns = [
    { name: "order_no", title: "订单号" },
    { name: "product_name", title: "产品名称" },
    { name: "amount", title: "金额" },
    { name: "status", title: "状态" },
    { name: "created_at", title: "下单时间" },
  ];
  
  return (
    <TableSlot 
      title="我的订单"
      columns={columns}
      data={orders}
    />
  );
}
```

### 2. 积分管理

积分管理功能允许用户：
- 查看当前积分余额
- 充值积分
- 查看积分消费记录

详细内容请参考 [积分管理文档](./credits-management.md)。

### 3. API 密钥管理

用户可以管理自己的 API 密钥：
- 生成新的 API 密钥
- 查看现有密钥
- 删除不再使用的密钥
- 设置密钥的使用限制

详细内容请参考 [API 密钥管理文档](./api-keys-management.md)。

### 4. 个人资料

用户可以编辑个人信息：

```typescript
// pages/console/profile.tsx
export default async function Profile() {
  const userInfo = await getUserInfo();
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={userInfo.email}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            昵称
          </label>
          <input
            type="text"
            defaultValue={userInfo.nickname}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            头像
          </label>
          <div className="flex items-center space-x-4">
            <img 
              src={userInfo.avatar_url} 
              className="w-16 h-16 rounded-full"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              更换头像
            </button>
          </div>
        </div>
        
        <button 
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          保存修改
        </button>
      </form>
    </div>
  );
}
```

## 安全机制

### 1. 身份验证
- 所有页面都需要用户登录
- 未登录用户会被重定向到登录页面

### 2. 数据隔离
- 用户只能查看和管理自己的数据
- 使用用户 UUID 进行数据过滤

### 3. 操作验证
- 敏感操作需要二次确认
- 重要操作记录操作日志

## 扩展功能

### 添加新的功能模块

1. 在侧边栏配置中添加新菜单项：

```typescript
{
  title: "联盟计划",
  url: "/console/affiliate",
  icon: "RiShareLine",
}
```

2. 创建对应的页面组件：

```typescript
// pages/console/affiliate.tsx
export default async function Affiliate() {
  // 实现联盟计划功能
  return (
    <div>
      <h1>联盟计划</h1>
      {/* 功能实现 */}
    </div>
  );
}
```

### 自定义控制台样式

可以通过修改 `ConsoleLayout` 组件或传入自定义样式类来定制控制台外观。

## 最佳实践

1. **用户体验**
   - 提供清晰的导航结构
   - 使用友好的错误提示
   - 实现加载状态显示

2. **性能优化**
   - 使用分页加载大量数据
   - 实现数据缓存
   - 优化图片加载

3. **响应式设计**
   - 确保在移动端可用
   - 适配不同屏幕尺寸
   - 使用触摸友好的交互

4. **国际化支持**
   - 使用 i18n 进行文本翻译
   - 支持多语言切换
   - 本地化日期和货币格式