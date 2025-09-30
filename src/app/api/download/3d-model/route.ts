import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelUrl = searchParams.get('url');
    const filename = searchParams.get('filename');

    if (!modelUrl) {
      return NextResponse.json(
        { error: '缺少模型URL参数' },
        { status: 400 }
      );
    }

    console.log('[Download API] 下载请求:', { modelUrl, filename });

    // 如果是本地存储URL，直接重定向到本地存储API（带download参数和filename）
    if (modelUrl.startsWith('/api/storage/')) {
      const url = new URL(modelUrl, req.url);
      url.searchParams.set('download', '1');
      if (filename) {
        url.searchParams.set('filename', filename);
      }
      console.log('[Download API] 重定向到本地存储:', url.toString());
      return NextResponse.redirect(url);
    }

    // 验证URL是否来自腾讯云COS
    if (!modelUrl.includes('tencentcos.cn') && !modelUrl.includes('cos.ap-')) {
      return NextResponse.json(
        { error: '不支持的模型URL' },
        { status: 400 }
      );
    }

    // 获取文件
    const response = await fetch(modelUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShipAny-AI-Platform/1.0)',
      },
    });

    if (!response.ok) {
      console.error('[Download API] 获取文件失败:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    console.log('[Download API] 文件大小:', data.byteLength, 'bytes');

    // 根据文件扩展名设置正确的Content-Type
    let contentType = 'application/octet-stream';
    let defaultFilename = 'model';
    
    if (modelUrl.includes('.glb')) {
      contentType = 'model/gltf-binary';
      defaultFilename = 'model.glb';
    } else if (modelUrl.includes('.gltf')) {
      contentType = 'model/gltf+json';
      defaultFilename = 'model.gltf';
    } else if (modelUrl.includes('.obj')) {
      contentType = 'text/plain';
      defaultFilename = 'model.obj';
    } else if (modelUrl.includes('.fbx')) {
      contentType = 'application/octet-stream';
      defaultFilename = 'model.fbx';
    } else if (modelUrl.includes('.stl')) {
      contentType = 'application/sla';
      defaultFilename = 'model.stl';
    }

    const finalFilename = filename || defaultFilename;

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Content-Length': data.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('[Download API] 下载错误:', error);
    return NextResponse.json(
      { error: '模型下载失败: ' + error.message },
      { status: 500 }
    );
  }
}
