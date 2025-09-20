# 管理后台 - 添加表格视图

## 概述

ShipAny 提供了强大的 `TableSlot` 组件，用于在管理后台快速创建数据表格视图。

## 基础实现

### 1. 导入必要组件

```typescript
import { TableSlot, TableColumn } from "@/components/console/table/table-slot";
import { Table as TableSlotType } from "@/types/table";
import { getUsers } from "@/models/user";
```

### 2. 基础表格实现

```typescript
export default async function UsersTable() {
  // 获取数据
  const users = await getUsers(1, 50);

  // 定义列
  const columns: TableColumn[] = [
    { name: "uuid", title: "UUID" },
    { name: "email", title: "邮箱" },
    { name: "created_at", title: "创建时间" },
  ];

  // 配置表格
  const table: TableSlotType = {
    title: "用户列表",
    columns,
    data: users,
  };

  return <TableSlot {...table} />;
}
```

## 高级功能

### 1. 自定义列渲染

```typescript
const columns: TableColumn[] = [
  {
    name: "email",
    title: "邮箱",
  },
  {
    name: "avatar_url",
    title: "头像",
    callback: (row) => (
      <img 
        src={row.avatar_url || "/default-avatar.png"} 
        className="w-10 h-10 rounded-full"
        alt={row.email}
      />
    ),
  },
  {
    name: "status",
    title: "状态",
    callback: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.status === "active" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {row.status === "active" ? "活跃" : "禁用"}
      </span>
    ),
  },
  {
    name: "created_at",
    title: "注册时间",
    callback: (row) => (
      <span>{moment(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</span>
    ),
  },
];
```

### 2. 添加操作列

```typescript
const columns: TableColumn[] = [
  // ... 其他列
  {
    name: "actions",
    title: "操作",
    callback: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => handleEdit(row.uuid)}
          className="text-blue-600 hover:text-blue-800"
        >
          编辑
        </button>
        <button 
          onClick={() => handleDelete(row.uuid)}
          className="text-red-600 hover:text-red-800"
        >
          删除
        </button>
      </div>
    ),
  },
];
```

### 3. 实现分页

```typescript
export default async function UsersTable({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  
  // 获取分页数据
  const { users, total } = await getUsersWithPagination(page, pageSize);
  
  const table: TableSlotType = {
    title: "用户列表",
    columns,
    data: users,
    pagination: {
      current: page,
      total: Math.ceil(total / pageSize),
      pageSize,
    },
  };

  return <TableSlot {...table} />;
}
```

### 4. 添加搜索和筛选

```typescript
export default async function UsersTable({ 
  searchParams 
}: { 
  searchParams: { 
    page?: string;
    search?: string;
    status?: string;
  } 
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const status = searchParams.status || "all";
  
  // 获取筛选后的数据
  const users = await getUsers({
    page,
    pageSize: 20,
    search,
    status,
  });
  
  const table: TableSlotType = {
    title: "用户列表",
    description: "管理系统中的所有用户",
    toolbar: (
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="搜索用户..."
          defaultValue={search}
          className="px-3 py-2 border rounded"
        />
        <select 
          defaultValue={status}
          className="px-3 py-2 border rounded"
        >
          <option value="all">全部</option>
          <option value="active">活跃</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
    ),
    columns,
    data: users,
  };

  return <TableSlot {...table} />;
}
```

## 数据模型示例

```typescript
// models/user.ts
import { db } from "@/lib/db";

export async function getUsers(
  page: number, 
  pageSize: number,
  filters?: {
    search?: string;
    status?: string;
  }
) {
  let query = db.selectFrom("users");
  
  // 应用搜索条件
  if (filters?.search) {
    query = query.where("email", "like", `%${filters.search}%`);
  }
  
  // 应用状态筛选
  if (filters?.status && filters.status !== "all") {
    query = query.where("status", "=", filters.status);
  }
  
  // 分页
  const users = await query
    .orderBy("created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .execute();
    
  return users;
}
```

## 最佳实践

### 1. 性能优化
- 使用服务端组件获取数据
- 实现分页避免一次加载过多数据
- 对大表使用索引优化查询

### 2. 用户体验
- 提供清晰的列标题
- 使用合适的列宽
- 对长文本使用省略号
- 提供有用的空状态提示

### 3. 安全性
- 在服务端验证用户权限
- 对敏感操作进行二次确认
- 记录重要操作的审计日志

### 4. 可复用性
创建通用的表格组件：

```typescript
// components/admin/UserTable.tsx
export function UserTable({ 
  data, 
  onEdit, 
  onDelete 
}: UserTableProps) {
  const columns: TableColumn[] = [
    // ... 列定义
  ];
  
  return <TableSlot columns={columns} data={data} />;
}
```

## 完整示例：订单管理表格

```typescript
import { TableSlot, TableColumn } from "@/components/console/table/table-slot";
import { Table as TableSlotType } from "@/types/table";
import { getOrders } from "@/models/order";
import moment from "moment";

export default async function OrdersTable() {
  const orders = await getOrders();
  
  const columns: TableColumn[] = [
    { 
      name: "order_no", 
      title: "订单号",
      callback: (row) => (
        <a 
          href={`/admin/orders/${row.uuid}`}
          className="text-blue-600 hover:underline"
        >
          {row.order_no}
        </a>
      ),
    },
    { 
      name: "user_email", 
      title: "用户",
    },
    { 
      name: "amount", 
      title: "金额",
      callback: (row) => `¥${row.amount.toFixed(2)}`,
    },
    { 
      name: "status", 
      title: "状态",
      callback: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === "paid" ? "bg-green-100 text-green-800" :
          row.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {row.status === "paid" ? "已支付" :
           row.status === "pending" ? "待支付" : "已取消"}
        </span>
      ),
    },
    { 
      name: "created_at", 
      title: "下单时间",
      callback: (row) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
    },
    {
      name: "actions",
      title: "操作",
      callback: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800">
            查看详情
          </button>
          {row.status === "paid" && (
            <button className="text-red-600 hover:text-red-800">
              退款
            </button>
          )}
        </div>
      ),
    },
  ];
  
  const table: TableSlotType = {
    title: "订单管理",
    description: "管理所有用户订单",
    columns,
    data: orders,
  };
  
  return <TableSlot {...table} />;
}
```