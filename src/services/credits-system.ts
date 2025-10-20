/**
 * ShipAny 内置积分系统服务
 * 使用 ShipAny 原生的 credits 表和 users.credits 字段
 */

import { db } from '@/db';
import { users, credits } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * 生成交易号
 */
function generateTransactionNo(): string {
  return `TX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

/**
 * 获取用户积分余额
 */
export async function getUserCreditsBalance(userUuid: string): Promise<number> {
  const userResult = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.uuid, userUuid))
    .limit(1);

  return userResult[0]?.credits || 0;
}

/**
 * 添加积分（通用方法）
 */
export async function addCredits(params: {
  userUuid: string;
  amount: number;
  type: 'recharge' | 'reward' | 'refund';
  description: string;
  orderNo?: string;
  expiredDays?: number;
}): Promise<void> {
  const { userUuid, amount, type, description, orderNo, expiredDays = 365 } = params;

  await db.transaction(async (tx) => {
    // 1. 获取当前积分
    const currentUser = await tx
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.uuid, userUuid))
      .limit(1);

    const currentCredits = currentUser[0]?.credits || 0;
    const newBalance = currentCredits + amount;

    // 2. 更新用户积分
    await tx
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.uuid, userUuid));

    // 3. 记录交易
    await tx.insert(credits).values({
      trans_no: generateTransactionNo(),
      user_uuid: userUuid,
      trans_type: type,
      credits: amount,
      order_no: orderNo,
      expired_at: new Date(Date.now() + expiredDays * 24 * 60 * 60 * 1000),
      created_at: new Date(),
    });
  });
}

/**
 * 扣除积分（通用方法）
 */
export async function deductCredits(params: {
  userUuid: string;
  amount: number;
  description: string;
  orderNo?: string;
}): Promise<{ success: boolean; newBalance: number }> {
  const { userUuid, amount, description, orderNo } = params;

  return await db.transaction(async (tx) => {
    // 1. 检查余额
    const currentUser = await tx
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.uuid, userUuid))
      .limit(1);

    const currentCredits = currentUser[0]?.credits || 0;

    if (currentCredits < amount) {
      throw new Error(`积分不足：当前 ${currentCredits}，需要 ${amount}`);
    }

    const newBalance = currentCredits - amount;

    // 2. 扣除积分
    await tx
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.uuid, userUuid));

    // 3. 记录交易
    await tx.insert(credits).values({
      trans_no: generateTransactionNo(),
      user_uuid: userUuid,
      trans_type: 'consume',
      credits: -amount,
      order_no: orderNo,
      created_at: new Date(),
    });

    return { success: true, newBalance };
  });
}

/**
 * 检查3D生成积分是否足够
 */
export async function check3DGenerationCredits(params: {
  userUuid: string;
  estimatedCredits: number;
}): Promise<{
  sufficient: boolean;
  currentBalance: number;
  required: number;
  shortage: number;
}> {
  const { userUuid, estimatedCredits } = params;

  const balance = await getUserCreditsBalance(userUuid);

  return {
    sufficient: balance >= estimatedCredits,
    currentBalance: balance,
    required: estimatedCredits,
    shortage: Math.max(0, estimatedCredits - balance),
  };
}

/**
 * 消耗3D生成积分
 */
export async function consume3DGenerationCredits(params: {
  userUuid: string;
  recordUuid: string;
  creditsConsumed: number;
  description: string;
}): Promise<void> {
  await deductCredits({
    userUuid: params.userUuid,
    amount: params.creditsConsumed,
    description: params.description,
    orderNo: params.recordUuid,
  });
}

/**
 * 退还3D生成积分
 */
export async function refund3DGenerationCredits(params: {
  userUuid: string;
  recordUuid: string;
  refundAmount: number;
  reason: string;
}): Promise<void> {
  await addCredits({
    userUuid: params.userUuid,
    amount: params.refundAmount,
    type: 'refund',
    description: `退款：${params.reason}`,
    orderNo: params.recordUuid,
  });
}

/**
 * 获取用户交易记录
 */
export async function getUserCreditTransactions(params: {
  userUuid: string;
  page?: number;
  limit?: number;
}): Promise<{
  transactions: any[];
  pagination: { page: number; limit: number; total: number };
}> {
  const { userUuid, page = 1, limit = 20 } = params;

  const transactions = await db
    .select()
    .from(credits)
    .where(eq(credits.user_uuid, userUuid))
    .orderBy(desc(credits.created_at))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    transactions: transactions.map(tx => ({
      ...tx,
      type: tx.trans_type,
      amount: tx.credits,
      description: getTransactionDescription(tx.trans_type, tx.credits),
      balance_after: 0, // ShipAny 原生表不记录此字段
    })),
    pagination: {
      page,
      limit,
      total: transactions.length, // 简化版，实际应该查询总数
    },
  };
}

/**
 * 处理注册奖励
 */
export async function handleRegisterReward(params: {
  userUuid: string;
  inviteCode?: string;
}): Promise<{
  success: boolean;
  totalCredits: number;
  breakdown: { register: number; invite: number };
}> {
  const { userUuid, inviteCode } = params;
  const CREDITS_CONFIG = await import('@/config/credits').then(m => m.CREDITS_CONFIG);

  let totalCredits = CREDITS_CONFIG.REGISTER_REWARD;
  const breakdown = {
    register: CREDITS_CONFIG.REGISTER_REWARD,
    invite: 0,
  };

  await db.transaction(async (tx) => {
    // 1. 发放注册奖励
    await addCredits({
      userUuid,
      amount: CREDITS_CONFIG.REGISTER_REWARD,
      type: 'reward',
      description: '新用户注册奖励',
    });

    // 2. 处理邀请码
    if (inviteCode) {
      // 查找邀请人
      const inviter = await tx
        .select({ uuid: users.uuid })
        .from(users)
        .where(eq(users.invite_code, inviteCode))
        .limit(1);

      if (inviter[0]) {
        // 给被邀请人额外积分
        await addCredits({
          userUuid,
          amount: CREDITS_CONFIG.INVITE_REWARD_INVITEE,
          type: 'reward',
          description: `使用邀请码注册奖励`,
        });

        // 给邀请人积分
        await addCredits({
          userUuid: inviter[0].uuid,
          amount: CREDITS_CONFIG.INVITE_REWARD_INVITER,
          type: 'reward',
          description: `邀请新用户奖励`,
        });

        totalCredits += CREDITS_CONFIG.INVITE_REWARD_INVITEE;
        breakdown.invite = CREDITS_CONFIG.INVITE_REWARD_INVITEE;

        // 更新 invited_by
        await tx
          .update(users)
          .set({ invited_by: inviter[0].uuid })
          .where(eq(users.uuid, userUuid));
      }
    }
  });

  return {
    success: true,
    totalCredits,
    breakdown,
  };
}

/**
 * 获取邀请记录（基于 affiliates 表）
 */
export async function getUserInvitations(params: {
  userUuid: string;
  page?: number;
  limit?: number;
}): Promise<{
  invitations: any[];
  pagination: { page: number; limit: number; total: number };
}> {
  const { userUuid, page = 1, limit = 10 } = params;

  // 基于 invited_by 字段查询
  const invitedUsers = await db
    .select()
    .from(users)
    .where(eq(users.invited_by, userUuid))
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset((page - 1) * limit);

  const CREDITS_CONFIG = await import('@/config/credits').then(m => m.CREDITS_CONFIG);

  return {
    invitations: invitedUsers.map(user => ({
      invitation: {
        uuid: user.uuid,
        created_at: user.created_at,
        inviter_reward: CREDITS_CONFIG.INVITE_REWARD_INVITER,
      },
      invitee: {
        uuid: user.uuid,
        nickname: user.nickname,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    })),
    pagination: {
      page,
      limit,
      total: invitedUsers.length,
    },
  };
}

/**
 * 获取交易描述
 */
function getTransactionDescription(transType: string, amount: number): string {
  const typeMap: Record<string, string> = {
    reward: '奖励',
    recharge: '充值',
    consume: '消费',
    refund: '退款',
  };

  const type = typeMap[transType] || transType;
  return `${type} ${amount > 0 ? '+' : ''}${amount} 积分`;
}
