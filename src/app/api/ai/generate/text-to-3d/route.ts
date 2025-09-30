import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users, aiGenerationRecords, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Model3DService, type Model3DParams } from '@/lib/ai/model3d-service';
import { SmartQueueManager } from '@/lib/queue/model3d-queue';
import { localStorage } from '@/lib/storage/local-storage';

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

    console.log('[3D生成API] 请求参数:', {
      hasPrompt: !!prompt,
      hasImageUrl: !!imageUrl,
      hasImageBase64: !!imageBase64 && imageBase64.length > 0,
      multiViewCount: multiViewImages?.length || 0,
      version,
      generateType
    });

    // 检查是否有任何有效输入：文本、主图片或多视图图片
    if (!prompt && !imageUrl && !imageBase64 && (!multiViewImages || multiViewImages.length === 0)) {
      return NextResponse.json(
        { error: '请提供文本描述、主图片或多视图图片' },
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

    // 生成记录UUID（需要提前生成，用于存储路径）
    const recordUuid = uuidv4();

    // 处理多视图图片：分离正面图（主图）和其他视图
    let frontImage = null;
    let processedMultiViewImages: Array<{viewType: 'left' | 'right' | 'back'; viewImageUrl: string}> = [];
    
    if (multiViewImages && multiViewImages.length > 0) {
      // 从多视图中提取正面图作为主图
      const frontView = multiViewImages.find((img: any) => img.viewType === 'front');
      const otherViews = multiViewImages.filter((img: any) => img.viewType !== 'front');
      
      if (frontView) {
        frontImage = frontView;
      }
      
      // 如果有其他视图（left, right, back），保存到本地存储
      if (otherViews.length > 0) {
        try {
          const savedImages = await localStorage.saveMultiViewImages(
            user.uuid,
            recordUuid,
            otherViews.map((img: any) => ({
              viewType: img.viewType,
              viewImageBase64: img.viewImageBase64
            }))
          );

          // 转换为完整URL（需要加上域名）
          const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
          processedMultiViewImages = savedImages.map(img => ({
            viewType: img.viewType as 'left' | 'right' | 'back',
            viewImageUrl: `${baseUrl}${img.viewImageUrl}`
          }));

          console.log('[3D生成] 多视图图片已保存到本地:', processedMultiViewImages);
        } catch (error) {
          console.error('Failed to save multiview images:', error);
          throw new Error('多视图图片保存失败');
        }
      }
    }
    
    // 确定最终的主图：优先使用正面图，否则使用原来的imageBase64
    let finalImageBase64 = imageBase64;
    if (frontImage && frontImage.viewImageBase64) {
      finalImageBase64 = frontImage.viewImageBase64;
    }

    const model3dService = new Model3DService();
    const params: Model3DParams = {
      version: version as 'basic' | 'pro' | 'rapid',
      prompt,
      imageUrl,
      imageBase64: finalImageBase64,
      multiViewImages: processedMultiViewImages,
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

    const transUuid = uuidv4();

    await db.insert(aiGenerationRecords).values({
      uuid: recordUuid,
      user_uuid: user.uuid,
      type: prompt ? 'text23d' : 'img23d',
      prompt,
      input_images: imageUrl || imageBase64 ? { url: imageUrl, base64: imageBase64 } : null,
      multi_view_images: processedMultiViewImages,
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