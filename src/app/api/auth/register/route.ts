import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encryptPassword, validatePasswordStrength } from '@/lib/password';
import { getUuid } from '@/lib/hash';
import { v4 as uuidv4 } from 'uuid';
// ✅ 使用 ShipAny 原生积分服务
import { increaseCredits, CreditsTransType } from '@/services/credit';

// 积分配置
const CREDITS_CONFIG = {
  REGISTER_REWARD: 100,      // 注册奖励
  INVITE_REWARD_INVITER: 50, // 邀请人奖励
  INVITE_REWARD_INVITEE: 50, // 被邀请人额外奖励
};

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname, inviteCode } = await req.json();

    // 1. 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 3. 加密密码
    const passwordEncrypted = encryptPassword(password);

    // 4. 生成唯一邀请码
    const userInviteCode = uuidv4().substring(0, 8);
    const userUuid = getUuid();

    // 5. 创建用户（初始积分为0，后续通过积分系统发放）
    const newUser = await db.insert(users).values({
      uuid: userUuid,
      email: email.toLowerCase(),
      nickname: nickname || email.split('@')[0],
      password_encrypted: passwordEncrypted,
      account_type: 'email',
      credits: 0, // 初始为0，由积分系统统一管理
      invite_code: userInviteCode,
      signin_type: 'credentials',
      signin_provider: 'email',
      created_at: new Date(),
    }).returning();

    // 6. 发放注册奖励（使用 ShipAny 原生方法）
    let totalCredits = CREDITS_CONFIG.REGISTER_REWARD;

    // 6.1 发放基础注册奖励
    await increaseCredits({
      user_uuid: newUser[0].uuid,
      trans_type: CreditsTransType.NewUser,
      credits: CREDITS_CONFIG.REGISTER_REWARD,
      expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      order_no: '',
    });

    // 6.2 处理邀请码逻辑
    if (inviteCode) {
      // 查找邀请人
      const inviter = await db
        .select()
        .from(users)
        .where(eq(users.invite_code, inviteCode))
        .limit(1);

      if (inviter[0]) {
        // 给被邀请人额外积分
        await increaseCredits({
          user_uuid: newUser[0].uuid,
          trans_type: CreditsTransType.SystemAdd,
          credits: CREDITS_CONFIG.INVITE_REWARD_INVITEE,
          expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          order_no: '',
        });

        // 给邀请人积分
        await increaseCredits({
          user_uuid: inviter[0].uuid,
          trans_type: CreditsTransType.SystemAdd,
          credits: CREDITS_CONFIG.INVITE_REWARD_INVITER,
          expired_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          order_no: '',
        });

        // 更新被邀请人的 invited_by 字段
        await db
          .update(users)
          .set({ invited_by: inviter[0].uuid })
          .where(eq(users.uuid, newUser[0].uuid));

        totalCredits += CREDITS_CONFIG.INVITE_REWARD_INVITEE;

        console.log('[邀请奖励发放成功]', {
          inviter: inviter[0].email,
          invitee: newUser[0].email,
          inviterReward: CREDITS_CONFIG.INVITE_REWARD_INVITER,
          inviteeReward: CREDITS_CONFIG.INVITE_REWARD_INVITEE,
        });
      }
    }

    console.log('[注册成功]', {
      email: newUser[0].email,
      nickname: newUser[0].nickname,
      inviteCode: inviteCode || 'none',
      totalCredits,
    });

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        email: newUser[0].email,
        nickname: newUser[0].nickname,
        inviteCode: newUser[0].invite_code,
        creditsAwarded: totalCredits,
      },
    });

  } catch (error: any) {
    console.error('[注册失败]', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}





