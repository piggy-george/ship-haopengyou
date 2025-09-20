# 积分管理系统

## 概述

ShipAny 内置了完整的积分管理系统，适合开发者构建基于积分的服务模式。用户可以充值积分、查看余额和消费记录。

## 系统架构

### 数据库设计

创建 `credits` 表存储积分交易记录：

```sql
CREATE TABLE credits (
  id SERIAL PRIMARY KEY,
  transaction_no VARCHAR(50) UNIQUE NOT NULL,
  user_uuid UUID NOT NULL REFERENCES users(uuid),
  transaction_type VARCHAR(20) NOT NULL, -- 'recharge', 'consume', 'reward'
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  description TEXT,
  expired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询
CREATE INDEX idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX idx_credits_created_at ON credits(created_at);
CREATE INDEX idx_credits_expired_at ON credits(expired_at);
```

## 核心功能实现

### 1. 新用户积分分配

```typescript
// models/credit.ts
export async function grantNewUserCredits(userUuid: string) {
  const NEW_USER_CREDITS = parseInt(process.env.NEW_USER_CREDITS || "100");
  const VALIDITY_DAYS = parseInt(process.env.CREDIT_VALIDITY_DAYS || "30");
  
  if (NEW_USER_CREDITS <= 0) return;
  
  const transaction = {
    transaction_no: generateTransactionNo(),
    user_uuid: userUuid,
    transaction_type: "reward",
    amount: NEW_USER_CREDITS,
    balance: NEW_USER_CREDITS,
    description: "新用户注册赠送",
    expired_at: new Date(Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000),
  };
  
  await db.insertInto("credits").values(transaction).execute();
}
```

### 2. 积分充值

```typescript
// models/credit.ts
export async function rechargeCredits(
  userUuid: string, 
  amount: number, 
  orderId: string,
  validityDays: number = 365
) {
  // 获取当前余额
  const currentBalance = await getUserCreditBalance(userUuid);
  
  const transaction = {
    transaction_no: generateTransactionNo(),
    user_uuid: userUuid,
    transaction_type: "recharge",
    amount: amount,
    balance: currentBalance + amount,
    description: `订单充值 #${orderId}`,
    expired_at: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
  };
  
  await db.insertInto("credits").values(transaction).execute();
  
  return transaction;
}
```

### 3. 积分消费

```typescript
// models/credit.ts
export async function consumeCredits(
  userUuid: string,
  amount: number,
  description: string
) {
  // 检查余额
  const balance = await getUserCreditBalance(userUuid);
  
  if (balance < amount) {
    throw new Error("积分余额不足");
  }
  
  const transaction = {
    transaction_no: generateTransactionNo(),
    user_uuid: userUuid,
    transaction_type: "consume",
    amount: -amount, // 消费为负数
    balance: balance - amount,
    description: description,
  };
  
  await db.insertInto("credits").values(transaction).execute();
  
  return transaction;
}
```

### 4. 获取用户积分余额

```typescript
// models/credit.ts
export async function getUserCreditBalance(userUuid: string): Promise<number> {
  // 获取所有未过期的积分记录
  const credits = await db
    .selectFrom("credits")
    .select(["amount"])
    .where("user_uuid", "=", userUuid)
    .where("expired_at", ">", new Date())
    .execute();
  
  // 计算总余额
  return credits.reduce((sum, credit) => sum + credit.amount, 0);
}
```

### 5. 积分交易历史

```typescript
// models/credit.ts
export async function getCreditHistory(
  userUuid: string,
  page: number = 1,
  pageSize: number = 20
) {
  const transactions = await db
    .selectFrom("credits")
    .selectAll()
    .where("user_uuid", "=", userUuid)
    .orderBy("created_at", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .execute();
    
  return transactions;
}
```

## 积分消费规则配置

### 1. 定义消费规则

```typescript
// config/credit-rules.ts
export const CREDIT_RULES = {
  // 图片生成
  IMAGE_GENERATION: {
    SD_1_5: 2,        // Stable Diffusion 1.5
    SDXL: 3,          // SDXL
    MIDJOURNEY: 5,    // Midjourney
  },
  
  // 视频生成
  VIDEO_GENERATION: {
    SHORT_CLIP: 10,   // 短视频（<30秒）
    MEDIUM_CLIP: 20,  // 中等视频（30-60秒）
    LONG_CLIP: 50,    // 长视频（>60秒）
  },
  
  // 文本生成
  TEXT_GENERATION: {
    GPT_3_5: 1,       // GPT-3.5
    GPT_4: 3,         // GPT-4
    CLAUDE: 2,        // Claude
  },
  
  // API 调用
  API_CALLS: {
    STANDARD: 1,      // 标准 API 调用
    PREMIUM: 3,       // 高级 API 调用
  },
};
```

### 2. 实现消费检查中间件

```typescript
// middleware/credit-check.ts
export async function checkCredits(
  requiredCredits: number
): Promise<MiddlewareFunction> {
  return async (req, res, next) => {
    const userUuid = req.user.uuid;
    
    try {
      const balance = await getUserCreditBalance(userUuid);
      
      if (balance < requiredCredits) {
        return res.status(402).json({
          error: "INSUFFICIENT_CREDITS",
          message: "积分余额不足",
          required: requiredCredits,
          balance: balance,
        });
      }
      
      // 将余额信息附加到请求对象
      req.creditBalance = balance;
      next();
    } catch (error) {
      return res.status(500).json({
        error: "CREDIT_CHECK_FAILED",
        message: "积分检查失败",
      });
    }
  };
}
```

### 3. 在 API 中使用

```typescript
// api/generate-image.ts
app.post(
  "/api/generate-image",
  authenticate,
  checkCredits(CREDIT_RULES.IMAGE_GENERATION.SDXL),
  async (req, res) => {
    try {
      // 生成图片
      const image = await generateImage(req.body);
      
      // 扣除积分
      await consumeCredits(
        req.user.uuid,
        CREDIT_RULES.IMAGE_GENERATION.SDXL,
        `生成图片: ${req.body.prompt.substring(0, 50)}...`
      );
      
      res.json({ success: true, image });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

## 用户界面实现

### 1. 积分余额显示

```typescript
// components/console/credit-balance.tsx
export async function CreditBalance() {
  const userInfo = await getUserInfo();
  const balance = await getUserCreditBalance(userInfo.uuid);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-2">积分余额</h2>
      <div className="text-3xl font-bold text-blue-600">
        {balance.toLocaleString()}
      </div>
      <a 
        href="/console/credits/recharge"
        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded"
      >
        充值积分
      </a>
    </div>
  );
}
```

### 2. 积分充值页面

```typescript
// pages/console/credits/recharge.tsx
export default function RechargePage() {
  const packages = [
    { credits: 100, price: 10, validity: 30 },
    { credits: 500, price: 45, validity: 90 },
    { credits: 1000, price: 80, validity: 180 },
    { credits: 5000, price: 350, validity: 365 },
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">充值积分</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.credits}
            className="border rounded-lg p-6 hover:border-blue-500"
          >
            <div className="text-3xl font-bold">{pkg.credits}</div>
            <div className="text-gray-500">积分</div>
            <div className="mt-4 text-2xl">¥{pkg.price}</div>
            <div className="text-sm text-gray-500">
              有效期 {pkg.validity} 天
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded">
              购买
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. 积分历史记录

```typescript
// pages/console/credits/history.tsx
export default async function CreditHistory() {
  const userInfo = await getUserInfo();
  const transactions = await getCreditHistory(userInfo.uuid);
  
  const columns: TableColumn[] = [
    {
      name: "created_at",
      title: "时间",
      callback: (row) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
    },
    {
      name: "transaction_type",
      title: "类型",
      callback: (row) => {
        const typeMap = {
          recharge: "充值",
          consume: "消费",
          reward: "赠送",
        };
        return typeMap[row.transaction_type] || row.transaction_type;
      },
    },
    {
      name: "amount",
      title: "积分",
      callback: (row) => (
        <span className={row.amount > 0 ? "text-green-600" : "text-red-600"}>
          {row.amount > 0 ? "+" : ""}{row.amount}
        </span>
      ),
    },
    {
      name: "balance",
      title: "余额",
    },
    {
      name: "description",
      title: "说明",
    },
  ];
  
  return (
    <TableSlot
      title="积分历史"
      columns={columns}
      data={transactions}
    />
  );
}
```

## 最佳实践

### 1. 积分过期处理

定期清理过期积分：

```typescript
// cron/clean-expired-credits.ts
export async function cleanExpiredCredits() {
  const expiredCredits = await db
    .selectFrom("credits")
    .select(["user_uuid", "amount"])
    .where("expired_at", "<", new Date())
    .where("amount", ">", 0) // 只处理正数积分
    .execute();
    
  for (const credit of expiredCredits) {
    await consumeCredits(
      credit.user_uuid,
      credit.amount,
      "积分过期"
    );
  }
}
```

### 2. 积分预警通知

```typescript
// services/credit-notification.ts
export async function checkLowBalance(userUuid: string) {
  const balance = await getUserCreditBalance(userUuid);
  const LOW_BALANCE_THRESHOLD = 10;
  
  if (balance < LOW_BALANCE_THRESHOLD) {
    await sendNotification(userUuid, {
      type: "LOW_CREDIT_BALANCE",
      title: "积分余额不足",
      message: `您的积分余额仅剩 ${balance}，请及时充值。`,
    });
  }
}
```

### 3. 积分统计报表

```typescript
// models/credit-stats.ts
export async function getUserCreditStats(userUuid: string) {
  const stats = await db
    .selectFrom("credits")
    .select([
      db.fn.sum("amount").filter(db.ref("transaction_type").equals("recharge")).as("total_recharged"),
      db.fn.sum("amount").filter(db.ref("transaction_type").equals("consume")).as("total_consumed"),
      db.fn.count("id").filter(db.ref("transaction_type").equals("consume")).as("consume_count"),
    ])
    .where("user_uuid", "=", userUuid)
    .executeTakeFirst();
    
  return stats;
}
```

## 安全考虑

1. **并发控制**：使用数据库事务确保积分操作的原子性
2. **审计日志**：记录所有积分变动的详细信息
3. **防刷保护**：限制积分消费的频率
4. **余额校验**：定期校验用户积分余额的准确性