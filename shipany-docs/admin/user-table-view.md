# 用户控制台 - 表格视图

## 概述

用户控制台中的表格视图与管理后台类似，但专注于展示用户个人的数据，如订单、积分记录等。主要区别在于数据过滤和权限控制。

## 与管理后台表格的区别

### 1. 数据范围
- **管理后台**：可以查看所有用户的数据
- **用户控制台**：只能查看当前登录用户的数据

### 2. 权限控制
- **管理后台**：基于管理员邮箱验证
- **用户控制台**：基于用户登录状态和 UUID

### 3. 功能差异
- **管理后台**：完整的 CRUD 操作
- **用户控制台**：通常只有查看权限，部分允许编辑

## 实现示例

### 1. 用户订单表格

```typescript
// pages/my-orders.tsx
import { redirect } from "next/navigation";
import { getUserInfo } from "@/models/user";
import { getOrdersByUser } from "@/models/order";
import { TableSlot, TableColumn } from "@/components/console/table/table-slot";
import { Table as TableSlotType } from "@/types/table";
import moment from "moment";
import { t } from "@/i18n";

export default async function MyOrders() {
  // 验证用户登录
  const userInfo = await getUserInfo();
  if (!userInfo) {
    redirect("/auth/signin");
  }
  
  // 获取用户订单
  const orders = await getOrdersByUser(userInfo.uuid);
  
  // 定义表格列
  const columns: TableColumn[] = [
    {
      name: "order_no",
      title: t("order.order_no"),
      callback: (row) => (
        <a 
          href={`/my-orders/${row.uuid}`}
          className="text-blue-600 hover:underline"
        >
          {row.order_no}
        </a>
      ),
    },
    {
      name: "product_name",
      title: t("order.product"),
    },
    {
      name: "amount",
      title: t("order.amount"),
      callback: (row) => (
        <span className="font-medium">
          {row.currency_symbol}{row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      name: "status",
      title: t("order.status"),
      callback: (row) => {
        const statusMap = {
          pending: { text: t("status.pending"), color: "yellow" },
          paid: { text: t("status.paid"), color: "green" },
          cancelled: { text: t("status.cancelled"), color: "gray" },
          refunded: { text: t("status.refunded"), color: "red" },
        };
        
        const status = statusMap[row.status] || { text: row.status, color: "gray" };
        
        return (
          <span className={`px-2 py-1 rounded text-xs bg-${status.color}-100 text-${status.color}-800`}>
            {status.text}
          </span>
        );
      },
    },
    {
      name: "created_at",
      title: t("order.created_at"),
      callback: (row) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
    },
    {
      name: "actions",
      title: t("common.actions"),
      callback: (row) => (
        <div className="flex gap-2">
          <a 
            href={`/my-orders/${row.uuid}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {t("common.view_details")}
          </a>
          {row.status === "paid" && (
            <a 
              href={`/my-orders/${row.uuid}/invoice`}
              className="text-green-600 hover:text-green-800"
            >
              {t("order.download_invoice")}
            </a>
          )}
        </div>
      ),
    },
  ];
  
  // 配置表格
  const table: TableSlotType = {
    title: t("user.my_orders"),
    description: t("user.my_orders_description"),
    columns,
    data: orders,
    emptyMessage: orders.length === 0 ? t("order.no_orders") : undefined,
  };
  
  return <TableSlot {...table} />;
}
```

### 2. 积分记录表格

```typescript
// pages/console/credits/history.tsx
export default async function CreditHistory() {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    redirect("/auth/signin");
  }
  
  // 获取积分记录
  const credits = await getCreditHistory(userInfo.uuid);
  
  const columns: TableColumn[] = [
    {
      name: "transaction_no",
      title: "交易号",
      callback: (row) => (
        <code className="text-sm">{row.transaction_no}</code>
      ),
    },
    {
      name: "transaction_type",
      title: "类型",
      callback: (row) => {
        const typeConfig = {
          recharge: { text: "充值", icon: "➕", color: "green" },
          consume: { text: "消费", icon: "➖", color: "red" },
          reward: { text: "赠送", icon: "🎁", color: "blue" },
          refund: { text: "退款", icon: "↩️", color: "yellow" },
        };
        
        const config = typeConfig[row.transaction_type] || { 
          text: row.transaction_type, 
          icon: "❓", 
          color: "gray" 
        };
        
        return (
          <span className={`flex items-center gap-1 text-${config.color}-600`}>
            <span>{config.icon}</span>
            <span>{config.text}</span>
          </span>
        );
      },
    },
    {
      name: "amount",
      title: "积分变动",
      callback: (row) => (
        <span className={`font-bold ${row.amount > 0 ? "text-green-600" : "text-red-600"}`}>
          {row.amount > 0 ? "+" : ""}{row.amount}
        </span>
      ),
    },
    {
      name: "balance",
      title: "余额",
      callback: (row) => (
        <span className="font-medium">{row.balance}</span>
      ),
    },
    {
      name: "description",
      title: "说明",
      callback: (row) => (
        <span className="text-sm text-gray-600">{row.description}</span>
      ),
    },
    {
      name: "created_at",
      title: "时间",
      callback: (row) => (
        <span className="text-sm">
          {moment(row.created_at).format("MM-DD HH:mm")}
        </span>
      ),
    },
  ];
  
  const table: TableSlotType = {
    title: "积分历史",
    toolbar: (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          当前余额：
          <span className="text-xl font-bold text-blue-600 ml-1">
            {userInfo.credit_balance || 0}
          </span>
        </div>
        <a 
          href="/console/credits/recharge"
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          充值积分
        </a>
      </div>
    ),
    columns,
    data: credits,
  };
  
  return <TableSlot {...table} />;
}
```

### 3. API 密钥表格

```typescript
// pages/console/api-keys/index.tsx
export default async function ApiKeys() {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    redirect("/auth/signin");
  }
  
  const apiKeys = await getApiKeysByUser(userInfo.uuid);
  
  const columns: TableColumn[] = [
    {
      name: "name",
      title: "名称",
      callback: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">
            创建于 {moment(row.created_at).format("YYYY-MM-DD")}
          </div>
        </div>
      ),
    },
    {
      name: "key_prefix",
      title: "密钥",
      callback: (row) => (
        <div className="flex items-center gap-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {row.key_prefix}••••••••
          </code>
          {row.is_new && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              新
            </span>
          )}
        </div>
      ),
    },
    {
      name: "usage",
      title: "使用情况",
      callback: (row) => (
        <div className="text-sm">
          <div>今日：{row.daily_requests || 0} / {row.daily_limit}</div>
          <div className="text-gray-500">
            总计：{row.total_requests || 0}
          </div>
        </div>
      ),
    },
    {
      name: "last_used_at",
      title: "最后使用",
      callback: (row) => (
        <span className="text-sm text-gray-600">
          {row.last_used_at 
            ? moment(row.last_used_at).fromNow()
            : "从未使用"}
        </span>
      ),
    },
    {
      name: "status",
      title: "状态",
      callback: (row) => {
        if (!row.is_active) {
          return (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
              已禁用
            </span>
          );
        }
        
        if (row.expires_at && new Date(row.expires_at) < new Date()) {
          return (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              已过期
            </span>
          );
        }
        
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            活跃
          </span>
        );
      },
    },
    {
      name: "actions",
      title: "操作",
      callback: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleStatus(row.uuid, !row.is_active)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {row.is_active ? "禁用" : "启用"}
          </button>
          <button
            onClick={() => handleDelete(row.uuid)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            删除
          </button>
        </div>
      ),
    },
  ];
  
  const table: TableSlotType = {
    title: "API 密钥",
    description: "管理您的 API 访问密钥",
    toolbar: (
      <a 
        href="/console/api-keys/new"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        创建新密钥
      </a>
    ),
    columns,
    data: apiKeys,
    emptyMessage: apiKeys.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">您还没有创建任何 API 密钥</p>
        <a 
          href="/console/api-keys/new"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
        >
          创建第一个密钥
        </a>
      </div>
    ) : undefined,
  };
  
  return <TableSlot {...table} />;
}
```

## 数据过滤和安全

### 1. 用户数据过滤

```typescript
// models/order.ts
export async function getOrdersByUser(
  userUuid: string,
  page: number = 1,
  pageSize: number = 20
) {
  // 确保只返回该用户的订单
  const orders = await db
    .selectFrom("orders")
    .selectAll()
    .where("user_uuid", "=", userUuid) // 关键：按用户 UUID 过滤
    .orderBy("created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .execute();
    
  return orders;
}
```

### 2. 双重验证

```typescript
// 在表格组件中再次验证数据所有权
export default async function MyOrderDetails({ params }: { params: { uuid: string } }) {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    redirect("/auth/signin");
  }
  
  const order = await getOrderByUuid(params.uuid);
  
  // 验证订单属于当前用户
  if (order.user_uuid !== userInfo.uuid) {
    redirect("/my-orders"); // 无权访问时重定向
  }
  
  // ... 显示订单详情
}
```

### 3. 敏感信息处理

```typescript
// 用户控制台中隐藏敏感信息
const columns: TableColumn[] = [
  {
    name: "payment_method",
    title: "支付方式",
    callback: (row) => {
      // 隐藏部分卡号
      if (row.payment_method === "credit_card") {
        return `•••• ${row.card_last4}`;
      }
      return row.payment_method;
    },
  },
  // ... 其他列
];
```

## 最佳实践

### 1. 用户友好的空状态

```typescript
const emptyState = (
  <div className="text-center py-12">
    <img 
      src="/empty-orders.svg" 
      className="w-48 h-48 mx-auto mb-4 opacity-50"
    />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      还没有订单
    </h3>
    <p className="text-gray-500 mb-6">
      您还没有购买任何产品，去商店看看吧！
    </p>
    <a 
      href="/shop"
      className="inline-block px-6 py-3 bg-blue-600 text-white rounded"
    >
      浏览商品
    </a>
  </div>
);
```

### 2. 响应式设计

```typescript
// 移动端优化的表格列
const mobileColumns: TableColumn[] = [
  {
    name: "summary",
    title: "订单信息",
    callback: (row) => (
      <div className="space-y-1">
        <div className="font-medium">{row.order_no}</div>
        <div className="text-sm text-gray-600">{row.product_name}</div>
        <div className="text-sm">
          <span className={`text-${getStatusColor(row.status)}-600`}>
            {getStatusText(row.status)}
          </span>
          <span className="mx-2">•</span>
          <span>{row.currency_symbol}{row.amount}</span>
        </div>
      </div>
    ),
  },
];
```

### 3. 实时数据更新

```typescript
// 使用 WebSocket 或轮询更新数据
"use client";

export function OrderStatusUpdater({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string>();
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await checkOrderStatus(orderId);
      if (result.status !== status) {
        setStatus(result.status);
        // 刷新页面或更新表格数据
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orderId, status]);
  
  // ... 渲染逻辑
}
```

## 总结

用户控制台的表格视图重点在于：

1. **数据隔离**：严格按用户过滤数据
2. **简化操作**：提供用户需要的核心功能
3. **友好体验**：清晰的界面和有用的提示
4. **安全第一**：多重验证确保数据安全
5. **响应式设计**：适配各种设备

通过合理使用 `TableSlot` 组件和适当的数据过滤，可以快速构建安全、美观的用户数据管理界面。