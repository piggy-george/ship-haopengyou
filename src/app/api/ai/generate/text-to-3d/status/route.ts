import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiGenerationRecords } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SmartQueueManager } from '@/lib/queue/model3d-queue';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (REQUIRE_LOGIN && !session?.user?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId');

    if (!recordId) {
      return NextResponse.json(
        { error: '缺少recordId参数' },
        { status: 400 }
      );
    }

    const records = await db.select().from(aiGenerationRecords)
      .where(eq(aiGenerationRecords.uuid, recordId))
      .limit(1);

    if (!records[0]) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }

    const record = records[0];

    if (record.status === 'pending' || record.status === 'processing') {
      try {
        const queueManager = SmartQueueManager.getInstance();
        const queueStats = await queueManager.getQueueStatus(recordId);

        return NextResponse.json({
          status: record.status,
          queue: queueStats,
          processingStartedAt: record.processing_started_at
        });
      } catch (error) {
        return NextResponse.json({
          status: record.status,
          processingStartedAt: record.processing_started_at
        });
      }
    }

    if (record.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        outputUrls: record.output_urls,
        completedAt: record.completed_at,
        expiresAt: record.expires_at
      });
    }

    if (record.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        errorMessage: record.error_message,
        completedAt: record.completed_at
      });
    }

    return NextResponse.json({
      status: record.status
    });

  } catch (error: any) {
    console.error('Status query error:', error);
    return NextResponse.json(
      { error: '查询失败' },
      { status: 500 }
    );
  }
}