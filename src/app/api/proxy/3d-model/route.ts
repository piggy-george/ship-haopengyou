import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelUrl = searchParams.get('url');

    if (!modelUrl) {
      return NextResponse.json(
        { error: '缺少模型URL参数' },
        { status: 400 }
      );
    }

    // 如果是本地存储URL，直接重定向到本地存储API
    if (modelUrl.startsWith('/api/storage/')) {
      console.log('[3D Proxy] 重定向到本地存储:', modelUrl);
      return NextResponse.redirect(new URL(modelUrl, req.url));
    }

    // 验证URL是否来自腾讯云COS
    if (!modelUrl.includes('tencentcos.cn') && !modelUrl.includes('cos.ap-')) {
      return NextResponse.json(
        { error: '不支持的模型URL' },
        { status: 400 }
      );
    }

    // 代理请求到腾讯云COS
    const response = await fetch(modelUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShipAny-AI-Platform/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`[3D Proxy] Failed to fetch model: ${response.status} ${response.statusText}`);
      
      // 检查是否是签名过期或权限问题
      if (response.status === 403) {
        return NextResponse.json(
          { error: '模型链接已过期，请重新生成' },
          { status: 403 }
        );
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // 检查返回的是否是错误信息（XML或HTML）而不是模型文件
    if (contentType.includes('xml') || contentType.includes('html')) {
      const errorText = await response.text();
      console.error('[3D Proxy] Received error response:', errorText);
      return NextResponse.json(
        { error: '模型链接无效或已过期' },
        { status: 400 }
      );
    }

    const data = await response.arrayBuffer();
    
    // 根据文件扩展名设置正确的Content-Type
    let outputContentType = 'application/octet-stream';
    if (modelUrl.includes('.glb')) {
      outputContentType = 'model/gltf-binary';
    } else if (modelUrl.includes('.gltf')) {
      outputContentType = 'model/gltf+json';
    } else if (modelUrl.includes('.obj')) {
      outputContentType = 'text/plain';
    } else if (modelUrl.includes('.fbx')) {
      outputContentType = 'application/octet-stream';
    } else if (modelUrl.includes('.stl')) {
      outputContentType = 'application/sla';
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': outputContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    });

  } catch (error: any) {
    console.error('3D模型代理错误:', error);
    return NextResponse.json(
      { error: '模型加载失败' },
      { status: 500 }
    );
  }
}
