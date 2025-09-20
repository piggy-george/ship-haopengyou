import { db } from '@/db'
import { users, creditTransactions } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getUserCredits(userUuid: string): Promise<number> {
  try {
    const user = await db.select({ credits: users.credits })
      .from(users)
      .where(eq(users.uuid, userUuid))
      .limit(1)

    return user[0]?.credits || 0
  } catch (error) {
    console.error('Failed to get user credits:', error)
    return 0
  }
}

export async function deductCredits(
  userUuid: string,
  amount: number,
  reason: string,
  description: string,
  relatedUuid?: string
): Promise<void> {
  try {
    // 开始事务
    await db.transaction(async (tx) => {
      // 检查余额
      const user = await tx.select({ credits: users.credits })
        .from(users)
        .where(eq(users.uuid, userUuid))
        .limit(1)

      const currentCredits = user[0]?.credits || 0
      if (currentCredits < amount) {
        throw new Error('积分余额不足')
      }

      // 扣除积分
      await tx.update(users)
        .set({ credits: currentCredits - amount })
        .where(eq(users.uuid, userUuid))

      // 记录交易
      await tx.insert(creditTransactions).values({
        uuid: generateTransactionUuid(),
        user_uuid: userUuid,
        type: 'spent',
        amount: -amount,
        reason,
        description,
        related_uuid: relatedUuid,
        created_at: new Date()
      })
    })
  } catch (error) {
    console.error('Failed to deduct credits:', error)
    throw error
  }
}

export async function addCredits(
  userUuid: string,
  amount: number,
  reason: string,
  description: string,
  relatedUuid?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 获取当前积分
      const user = await tx.select({ credits: users.credits })
        .from(users)
        .where(eq(users.uuid, userUuid))
        .limit(1)

      const currentCredits = user[0]?.credits || 0

      // 增加积分
      await tx.update(users)
        .set({ credits: currentCredits + amount })
        .where(eq(users.uuid, userUuid))

      // 记录交易
      await tx.insert(creditTransactions).values({
        uuid: generateTransactionUuid(),
        user_uuid: userUuid,
        type: 'earned',
        amount,
        reason,
        description,
        related_uuid: relatedUuid,
        created_at: new Date()
      })
    })
  } catch (error) {
    console.error('Failed to add credits:', error)
    throw error
  }
}

export async function refundCredits(
  userUuid: string,
  amount: number,
  reason: string,
  description: string,
  relatedUuid?: string
): Promise<void> {
  await addCredits(userUuid, amount, reason, description, relatedUuid)
}

export async function getCreditHistory(userUuid: string, limit: number = 50) {
  try {
    return await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.user_uuid, userUuid))
      .orderBy(desc(creditTransactions.created_at))
      .limit(limit)
  } catch (error) {
    console.error('Failed to get credit history:', error)
    return []
  }
}

export function getCreditPrice(amount: number): number {
  const prices = {
    10: 9.9,
    50: 45,
    100: 85,
    500: 399,
    1000: 750
  }

  return prices[amount as keyof typeof prices] || amount * 0.1
}

function generateTransactionUuid(): string {
  return 'tx_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}