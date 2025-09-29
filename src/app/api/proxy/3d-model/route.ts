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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    
    // 根据文件扩展名设置正确的Content-Type
    let contentType = 'application/octet-stream';
    if (modelUrl.includes('.glb')) {
      contentType = 'model/gltf-binary';
    } else if (modelUrl.includes('.gltf')) {
      contentType = 'model/gltf+json';
    } else if (modelUrl.includes('.obj')) {
      contentType = 'text/plain';
    } else if (modelUrl.includes('.fbx')) {
      contentType = 'application/octet-stream';
    } else if (modelUrl.includes('.stl')) {
      contentType = 'application/sla';
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
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
