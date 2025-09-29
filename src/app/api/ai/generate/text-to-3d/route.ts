import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users, aiGenerationRecords, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Model3DService, type Model3DParams } from '@/lib/ai/model3d-service';
import { SmartQueueManager } from '@/lib/queue/model3d-queue';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      prompt,
      imageUrl,
      imageBase64,
      multiViewImages,
      version = 'rapid',
      enablePBR = false,
      resultFormat = 'GLB',
      generateType = 'Normal',
      faceCount
    } = body;

    if (!prompt && !imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: '请提供文本描述或图片' },
        { status: 400 }
      );
    }

    const userResult = await db.select().from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    let user = userResult[0];

    // 测试模式：如果用户不存在，创建测试用户
    if (!user && !REQUIRE_LOGIN) {
      const testUserUuid = uuidv4();
      await db.insert(users).values({
        uuid: testUserUuid,
        email: userEmail,
        credits: 10000, // 给测试用户大量积分
        invite_code: 'TEST',
        nickname: 'Test User',
      });

      const newUserResult = await db.select().from(users)
        .where(eq(users.email, userEmail))
        .limit(1);
      user = newUserResult[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const model3dService = new Model3DService();
    const params: Model3DParams = {
      version: version as 'basic' | 'pro' | 'rapid',
      prompt,
      imageUrl,
      imageBase64,
      multiViewImages,
      enablePBR,
      resultFormat: resultFormat as any,
      generateType: generateType as any,
      faceCount
    };

    const creditsNeeded = model3dService.calculateCredits(params);

    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        { error: '积分不足', creditsNeeded, currentCredits: user.credits },
        { status: 400 }
      );
    }

    await db.update(users)
      .set({ credits: user.credits - creditsNeeded })
      .where(eq(users.uuid, user.uuid));

    const recordUuid = uuidv4();
    const transUuid = uuidv4();

    await db.insert(aiGenerationRecords).values({
      uuid: recordUuid,
      user_uuid: user.uuid,
      type: prompt ? 'text23d' : 'img23d',
      prompt,
      input_images: imageUrl || imageBase64 ? { url: imageUrl, base64: imageBase64 } : null,
      multi_view_images: multiViewImages,
      params: params as any,
      credits_used: creditsNeeded,
      status: 'pending'
    });

    await db.insert(creditTransactions).values({
      uuid: transUuid,
      user_uuid: user.uuid,
      type: 'spent',
      amount: -creditsNeeded,
      reason: 'ai_generation',
      description: `3D模型生成 (${version})`,
      related_uuid: recordUuid
    });

    const queueManager = SmartQueueManager.getInstance();
    await queueManager.addToQueue(recordUuid, version);

    const queueStats = await queueManager.getQueueStatus(recordUuid);

    return NextResponse.json({
      success: true,
      recordId: recordUuid,
      creditsUsed: creditsNeeded,
      remainingCredits: user.credits - creditsNeeded,
      queue: queueStats
    });

  } catch (error: any) {
    console.error('3D generation error:', error);
    return NextResponse.json(
      { error: error.message || '生成请求失败' },
      { status: 500 }
    );
  }
}