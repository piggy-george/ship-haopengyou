import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encryptPassword, validatePasswordStrength } from '@/lib/password';
import { getUuid } from '@/lib/hash';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

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

    // 4. 生成邀请码
    const inviteCode = uuidv4().substring(0, 8);

    // 5. 创建用户
    const newUser = await db.insert(users).values({
      uuid: getUuid(),
      email: email.toLowerCase(),
      nickname: nickname || email.split('@')[0],
      password_encrypted: passwordEncrypted,
      account_type: 'email',
      credits: 100, // 新用户赠送100积分
      invite_code: inviteCode,
      signin_type: 'credentials',
      signin_provider: 'email',
      created_at: new Date(),
    }).returning();

    console.log('[注册成功]', { email: newUser[0].email, nickname: newUser[0].nickname });

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        email: newUser[0].email,
        nickname: newUser[0].nickname,
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





