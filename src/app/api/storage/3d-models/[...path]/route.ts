/**
 * 本地存储的3D模型文件访问API
 * 
 * 路由格式：
 * GET /api/storage/3d-models/{recordUuid}/{filename}
 * GET /api/storage/3d-models/{recordUuid}/{filename}?download=1
 * 
 * 权限控制：
 * - 验证用户登录状态
 * - 验证用户是否有权限访问该记录的文件
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users, aiGenerationRecords } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { readLocalFile, getContentType } from '@/lib/storage/local-storage-service';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

/**
 * GET /api/storage/3d-models/{recordUuid}/{filename}
 * 
 * 获取3D模型文件
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
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

    const user = userResult[0];

    if (!user) {
      return NextResponse.json(
        { error: '用户未找到' },
        { status: 404 }
      );
    }

    // 解析路径参数
    const { path: pathSegments } = await params;
    
    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json(
        { error: '无效的文件路径' },
        { status: 400 }
      );
    }

    const [recordUuid, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/'); // 支持子目录

    console.log(`[Storage API] Request: recordUuid=${recordUuid}, filename=${filename}, user=${user.uuid}`);

    // 验证用户是否有权限访问该记录
    const recordResult = await db.select().from(aiGenerationRecords)
      .where(and(
        eq(aiGenerationRecords.uuid, recordUuid),
        eq(aiGenerationRecords.user_uuid, user.uuid)
      ))
      .limit(1);

    const record = recordResult[0];

    if (!record) {
      return NextResponse.json(
        { error: '记录未找到或无权限访问' },
        { status: 404 }
      );
    }

    // 检查记录是否过期
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { error: '文件已过期' },
        { status: 410 } // 410 Gone
      );
    }

    // 读取文件
    try {
      const fileBuffer = await readLocalFile(user.uuid, recordUuid, filename);

      // 检查是否是下载请求
      const isDownload = req.nextUrl.searchParams.get('download') === '1';
      
      // 获取自定义文件名（如果有的话）
      const customFilename = req.nextUrl.searchParams.get('filename') || filename;

      // 设置响应头
      const contentType = getContentType(filename);
      const headers: HeadersInit = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存24小时
      };

      // 如果是下载请求，添加Content-Disposition
      if (isDownload) {
        headers['Content-Disposition'] = `attachment; filename="${customFilename}"`;
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error(`[Storage API] File read error:`, error);
      return NextResponse.json(
        { error: '文件不存在或读取失败' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Storage API] Error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/storage/3d-models/{recordUuid}/{filename}
 * 
 * 检查文件是否存在（用于验证链接有效性）
 */
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await auth();

    let userEmail = session?.user?.email;

    if (REQUIRE_LOGIN && !userEmail) {
      return new NextResponse(null, { status: 401 });
    }

    if (!REQUIRE_LOGIN && !userEmail) {
      userEmail = 'test@example.com';
    }

    const userResult = await db.select().from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return new NextResponse(null, { status: 404 });
    }

    const { path: pathSegments } = await params;
    
    if (!pathSegments || pathSegments.length < 2) {
      return new NextResponse(null, { status: 400 });
    }

    const [recordUuid, ...filenameParts] = pathSegments;
    const filename = filenameParts.join('/');

    // 验证权限
    const recordResult = await db.select().from(aiGenerationRecords)
      .where(and(
        eq(aiGenerationRecords.uuid, recordUuid),
        eq(aiGenerationRecords.user_uuid, user.uuid)
      ))
      .limit(1);

    const record = recordResult[0];

    if (!record) {
      return new NextResponse(null, { status: 404 });
    }

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return new NextResponse(null, { status: 410 });
    }

    // 检查文件是否存在
    try {
      await readLocalFile(user.uuid, recordUuid, filename);
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': getContentType(filename),
        },
      });
    } catch (error) {
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error('[Storage API HEAD] Error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
