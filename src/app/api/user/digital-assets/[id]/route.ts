import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users, aiGenerationRecords } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

// 删除数字资产
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // 测试模式：如果未登录，使用测试用户
    let userEmail = session?.user?.email;

    if (REQUIRE_LOGIN && !userEmail) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 测试模式下使用默认邮箱
    if (!REQUIRE_LOGIN && !userEmail) {
      userEmail = 'test@example.com';
    }

    // 获取用户信息
    const userResult = await db.select().from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!userResult[0]) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    const { id } = await params;

    // 检查记录是否存在且属于该用户
    const records = await db.select()
      .from(aiGenerationRecords)
      .where(
        and(
          eq(aiGenerationRecords.uuid, id),
          eq(aiGenerationRecords.user_uuid, user.uuid)
        )
      )
      .limit(1);

    if (!records[0]) {
      return NextResponse.json(
        { error: '记录不存在或无权限删除' },
        { status: 404 }
      );
    }

    // 删除记录
    await db.delete(aiGenerationRecords)
      .where(eq(aiGenerationRecords.uuid, id));

    return NextResponse.json({
      success: true,
      message: '数字资产已删除'
    });

  } catch (error: any) {
    console.error('删除数字资产错误:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
