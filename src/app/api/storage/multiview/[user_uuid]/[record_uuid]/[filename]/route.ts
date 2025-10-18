import { NextRequest, NextResponse } from 'next/server';
import { localStorage } from '@/lib/storage/local-storage';

/**
 * 多视图图片访问API
 * GET /api/storage/multiview/{user_uuid}/{record_uuid}/{filename}
 * 
 * 例如：/api/storage/multiview/abc-123/def-456/left.png
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ user_uuid: string; record_uuid: string; filename: string }> }
) {
  try {
    const { user_uuid, record_uuid, filename } = await params;

    // 验证文件名（只允许 left.png, right.png, back.png）
    const allowedFiles = ['left.png', 'right.png', 'back.png'];
    if (!allowedFiles.includes(filename)) {
      return NextResponse.json(
        { error: '无效的文件名' },
        { status: 400 }
      );
    }

    // 读取文件
    const imageBuffer = await localStorage.readMultiViewImage(
      user_uuid,
      record_uuid,
      filename
    );

    // 返回图片
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // 缓存1年
      },
    });

  } catch (error: any) {
    console.error('Failed to read multiview image:', error);
    
    return NextResponse.json(
      { error: error.message || '图片不存在或已过期' },
      { status: 404 }
    );
  }
}
