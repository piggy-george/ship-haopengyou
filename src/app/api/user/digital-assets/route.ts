import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users, aiGenerationRecords } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

export async function GET(req: NextRequest) {
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

    // 获取用户的生成记录
    let records = await db.select().from(aiGenerationRecords)
      .where(eq(aiGenerationRecords.user_uuid, user.uuid))
      .orderBy(desc(aiGenerationRecords.created_at))
      .limit(100); // 限制最多返回100条记录

    // 移除模拟数据，使用真实的数据库记录

    // 转换为前端需要的格式
    const assets = records.map(record => {
      // 判断是否过期
      let status = record.status;
      if (record.status === 'completed' && record.expires_at) {
        const now = new Date();
        const expiresAt = new Date(record.expires_at);
        if (now > expiresAt) {
          status = 'expired';
        }
      }

      const asset = {
        id: record.uuid,
        type: record.type,
        prompt: record.prompt,
        outputUrls: record.output_urls || [],
        creditsUsed: record.credits_used,
        status,
        createdAt: record.created_at,
        expiresAt: record.expires_at,
        version: (record.params as any)?.version,
        params: record.params
      };

      // 记录资产信息用于调试
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Asset ${record.uuid}:`, {
          status: asset.status,
          outputUrls: asset.outputUrls,
          hasUrls: Array.isArray(asset.outputUrls) && asset.outputUrls.length > 0
        });
      }

      return asset;
    });

    return NextResponse.json({
      success: true,
      assets,
      total: assets.length
    });

  } catch (error: any) {
    console.error('获取数字资产错误:', error);
    return NextResponse.json(
      { error: '获取数字资产失败' },
      { status: 500 }
    );
  }
}
