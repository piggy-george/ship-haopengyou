# API 密钥管理

## 概述

API 密钥管理功能允许用户生成和管理用于访问 API 的密钥，支持权限控制、使用限制和安全管理。

## 数据库设计

### API 密钥表结构

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  user_uuid UUID NOT NULL REFERENCES users(uuid),
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,       -- 密钥前缀，用于识别
  key_hash VARCHAR(255) NOT NULL,        -- 密钥哈希值
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  -- 权限和限制
  permissions JSONB DEFAULT '[]',         -- 允许的权限列表
  rate_limit INTEGER DEFAULT 60,         -- 每分钟请求限制
  daily_limit INTEGER DEFAULT 10000,     -- 每日请求限制
  monthly_limit INTEGER DEFAULT 300000,  -- 每月请求限制
  
  -- 使用统计
  total_requests INTEGER DEFAULT 0,
  monthly_requests INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_api_keys_user_uuid ON api_keys(user_uuid);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
```

### API 使用记录表

```sql
CREATE TABLE api_key_usage (
  id SERIAL PRIMARY KEY,
  api_key_uuid UUID NOT NULL REFERENCES api_keys(uuid),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER,                 -- 响应时间（毫秒）
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_api_key_usage_key_uuid ON api_key_usage(api_key_uuid);
CREATE INDEX idx_api_key_usage_created_at ON api_key_usage(created_at);
```

## 核心功能实现

### 1. 生成 API 密钥

```typescript
// models/api-key.ts
import { randomBytes } from "crypto";
import { hash } from "bcrypt";

export async function generateApiKey(
  userUuid: string,
  name: string,
  permissions: string[] = []
) {
  // 生成密钥
  const keyBytes = randomBytes(32);
  const apiKey = `sk_${keyBytes.toString("hex")}`;
  const keyPrefix = apiKey.substring(0, 7); // sk_xxx
  
  // 哈希密钥
  const keyHash = await hash(apiKey, 10);
  
  // 保存到数据库
  const apiKeyRecord = await db
    .insertInto("api_keys")
    .values({
      user_uuid: userUuid,
      name: name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      permissions: JSON.stringify(permissions),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年有效期
    })
    .returning(["uuid", "key_prefix", "created_at"])
    .executeTakeFirst();
  
  // 只在创建时返回完整密钥
  return {
    ...apiKeyRecord,
    api_key: apiKey, // 只在这里返回一次
    message: "请妥善保管此密钥，只会显示一次",
  };
}
```

### 2. 验证 API 密钥

```typescript
// middleware/api-key-auth.ts
import { compare } from "bcrypt";

export async function validateApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("sk_")) {
    return null;
  }
  
  const keyPrefix = apiKey.substring(0, 7);
  
  // 查找所有匹配前缀的活跃密钥
  const candidates = await db
    .selectFrom("api_keys")
    .selectAll()
    .where("key_prefix", "=", keyPrefix)
    .where("is_active", "=", true)
    .where("expires_at", ">", new Date())
    .execute();
  
  // 验证密钥
  for (const candidate of candidates) {
    const isValid = await compare(apiKey, candidate.key_hash);
    if (isValid) {
      // 更新最后使用时间
      await db
        .updateTable("api_keys")
        .set({ last_used_at: new Date() })
        .where("uuid", "=", candidate.uuid)
        .execute();
        
      return candidate;
    }
  }
  
  return null;
}
```

### 3. API 密钥中间件

```typescript
// middleware/api-key-middleware.ts
export async function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"] || req.headers.authorization?.replace("Bearer ", "");
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }
  
  const keyRecord = await validateApiKey(apiKey);
  
  if (!keyRecord) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  
  // 检查权限
  if (!checkPermission(keyRecord.permissions, req.path, req.method)) {
    return res.status(403).json({ error: "Permission denied" });
  }
  
  // 检查速率限制
  const rateLimitOk = await checkRateLimit(keyRecord.uuid, keyRecord.rate_limit);
  if (!rateLimitOk) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }
  
  // 记录使用情况
  await recordApiUsage(keyRecord.uuid, req, res);
  
  // 附加用户信息到请求
  req.apiKey = keyRecord;
  req.userUuid = keyRecord.user_uuid;
  
  next();
}
```

### 4. 速率限制实现

```typescript
// services/rate-limiter.ts
import Redis from "ioredis";

const redis = new Redis();

export async function checkRateLimit(
  apiKeyUuid: string,
  limit: number
): Promise<boolean> {
  const key = `rate_limit:${apiKeyUuid}:${Math.floor(Date.now() / 60000)}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 60秒过期
  }
  
  return current <= limit;
}

// 检查每日限制
export async function checkDailyLimit(
  apiKeyUuid: string,
  limit: number
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const key = `daily_limit:${apiKeyUuid}:${today}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 86400); // 24小时过期
  }
  
  return current <= limit;
}
```

### 5. 权限管理

```typescript
// services/permission.ts
export function checkPermission(
  permissions: string[],
  path: string,
  method: string
): boolean {
  // 定义 API 端点权限映射
  const endpointPermissions = {
    "GET:/api/users": ["users:read"],
    "POST:/api/users": ["users:write"],
    "DELETE:/api/users": ["users:delete"],
    "GET:/api/orders": ["orders:read"],
    "POST:/api/orders": ["orders:write"],
    "GET:/api/credits": ["credits:read"],
    "POST:/api/credits": ["credits:write"],
  };
  
  const requiredPermissions = endpointPermissions[`${method}:${path}`] || [];
  
  // 检查是否有所需权限
  return requiredPermissions.every(perm => permissions.includes(perm));
}
```

## 用户界面实现

### 1. API 密钥列表页面

```typescript
// pages/console/api-keys/index.tsx
export default async function ApiKeys() {
  const userInfo = await getUserInfo();
  const apiKeys = await getApiKeysByUser(userInfo.uuid);
  
  const columns: TableColumn[] = [
    {
      name: "name",
      title: "名称",
    },
    {
      name: "key_prefix",
      title: "密钥前缀",
      callback: (row) => (
        <code className="bg-gray-100 px-2 py-1 rounded">
          {row.key_prefix}...
        </code>
      ),
    },
    {
      name: "permissions",
      title: "权限",
      callback: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.map(perm => (
            <span 
              key={perm}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {perm}
            </span>
          ))}
        </div>
      ),
    },
    {
      name: "last_used_at",
      title: "最后使用",
      callback: (row) => row.last_used_at 
        ? moment(row.last_used_at).fromNow()
        : "从未使用",
    },
    {
      name: "is_active",
      title: "状态",
      callback: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.is_active 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {row.is_active ? "活跃" : "禁用"}
        </span>
      ),
    },
    {
      name: "actions",
      title: "操作",
      callback: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => toggleApiKey(row.uuid, !row.is_active)}
            className="text-blue-600 hover:text-blue-800"
          >
            {row.is_active ? "禁用" : "启用"}
          </button>
          <button 
            onClick={() => deleteApiKey(row.uuid)}
            className="text-red-600 hover:text-red-800"
          >
            删除
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API 密钥管理</h1>
        <a 
          href="/console/api-keys/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          创建新密钥
        </a>
      </div>
      
      <TableSlot
        columns={columns}
        data={apiKeys}
      />
    </div>
  );
}
```

### 2. 创建 API 密钥页面

```typescript
// pages/console/api-keys/new.tsx
export default function NewApiKey() {
  const permissions = [
    { value: "users:read", label: "读取用户信息" },
    { value: "users:write", label: "修改用户信息" },
    { value: "orders:read", label: "读取订单信息" },
    { value: "orders:write", label: "创建订单" },
    { value: "credits:read", label: "读取积分信息" },
    { value: "credits:write", label: "操作积分" },
  ];
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">创建 API 密钥</h1>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            密钥名称
          </label>
          <input
            type="text"
            name="name"
            placeholder="例如：生产环境密钥"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            权限设置
          </label>
          <div className="space-y-2">
            {permissions.map(perm => (
              <label key={perm.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="permissions"
                  value={perm.value}
                  className="mr-2"
                />
                {perm.label}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            速率限制
          </label>
          <input
            type="number"
            name="rate_limit"
            defaultValue={60}
            className="w-full px-3 py-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            每分钟最大请求数
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            有效期
          </label>
          <select name="validity" className="w-full px-3 py-2 border rounded">
            <option value="30">30 天</option>
            <option value="90">90 天</option>
            <option value="180">180 天</option>
            <option value="365" selected>1 年</option>
            <option value="0">永不过期</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          创建密钥
        </button>
      </form>
    </div>
  );
}
```

### 3. 密钥创建成功页面

```typescript
// components/api-key-success.tsx
export function ApiKeySuccess({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-green-800 mb-4">
        API 密钥创建成功！
      </h2>
      
      <div className="bg-white border rounded p-4 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm break-all">{apiKey}</code>
          <button
            onClick={copyToClipboard}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
      
      <div className="text-red-600 font-medium">
        ⚠️ 重要提醒：请妥善保管此密钥，它只会显示一次！
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>使用方法：</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
{`// 在请求头中添加
headers: {
  "X-API-Key": "${apiKey}"
}

// 或使用 Bearer Token
headers: {
  "Authorization": "Bearer ${apiKey}"
}`}
        </pre>
      </div>
    </div>
  );
}
```

## API 使用示例

### 1. 使用 API 密钥调用接口

```javascript
// 客户端调用示例
const response = await fetch("https://api.example.com/v1/users", {
  headers: {
    "X-API-Key": "sk_your_api_key_here",
    "Content-Type": "application/json",
  },
});

// 或使用 Bearer Token 格式
const response = await fetch("https://api.example.com/v1/users", {
  headers: {
    "Authorization": "Bearer sk_your_api_key_here",
    "Content-Type": "application/json",
  },
});
```

### 2. API 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": {
    // 响应数据
  },
  "meta": {
    "rate_limit": {
      "limit": 60,
      "remaining": 45,
      "reset": 1640995200
    }
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 60,
      "reset": 1640995200
    }
  }
}
```

## 安全最佳实践

### 1. 密钥存储
- 使用 bcrypt 或 argon2 哈希算法存储密钥
- 永远不要存储明文密钥
- 只在创建时显示一次完整密钥

### 2. 密钥轮换
```typescript
// 定期提醒用户轮换密钥
export async function checkKeyRotation(userUuid: string) {
  const oldKeys = await db
    .selectFrom("api_keys")
    .selectAll()
    .where("user_uuid", "=", userUuid)
    .where("created_at", "<", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    .where("is_active", "=", true)
    .execute();
    
  if (oldKeys.length > 0) {
    await sendNotification(userUuid, {
      type: "API_KEY_ROTATION_REMINDER",
      title: "API 密钥安全提醒",
      message: "您有超过 90 天未更新的 API 密钥，建议进行轮换。",
    });
  }
}
```

### 3. 审计日志
```typescript
// 记录所有 API 密钥操作
export async function logApiKeyOperation(
  userUuid: string,
  operation: string,
  details: any
) {
  await db.insertInto("audit_logs").values({
    user_uuid: userUuid,
    entity_type: "api_key",
    operation: operation,
    details: JSON.stringify(details),
    ip_address: getClientIp(),
    user_agent: getUserAgent(),
    created_at: new Date(),
  }).execute();
}
```

### 4. IP 白名单
```typescript
// 支持 IP 白名单限制
export async function checkIpWhitelist(
  apiKeyUuid: string,
  clientIp: string
): Promise<boolean> {
  const whitelist = await db
    .selectFrom("api_key_ip_whitelist")
    .select("ip_address")
    .where("api_key_uuid", "=", apiKeyUuid)
    .execute();
    
  if (whitelist.length === 0) {
    return true; // 无白名单限制
  }
  
  return whitelist.some(entry => entry.ip_address === clientIp);
}
```