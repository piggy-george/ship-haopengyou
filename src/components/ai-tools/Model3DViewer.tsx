'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Move3D, Download, Maximize2, Minimize2, Smartphone, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Script from 'next/script';

interface Model3DViewerProps {
  modelUrl: string;
  modelType?: 'glb' | 'obj' | 'fbx';
  onClose?: () => void;
  showControls?: boolean;
  autoRotate?: boolean;
  enableAR?: boolean;
}

export function Model3DViewer({
  modelUrl,
  modelType = 'glb',
  onClose,
  showControls = true,
  autoRotate = true,
  enableAR = false
}: Model3DViewerProps) {
  // 检测文件格式
  const fileExtension = modelUrl?.toLowerCase().split('.').pop()?.split('?')[0] || modelType;
  const isSTL = fileExtension === 'stl';
  
  // 判断URL类型：
  // - 本地存储URL（/api/storage/...）：直接使用
  // - 腾讯COS URL：使用代理避免CORS问题
  const isLocalStorage = modelUrl?.startsWith('/api/storage/');
  const proxyUrl = isLocalStorage
    ? modelUrl
    : modelUrl && (modelUrl.includes('tencentcos.cn') || modelUrl.includes('cos.ap-'))
      ? `/api/proxy/3d-model?url=${encodeURIComponent(modelUrl)}`
      : modelUrl || '';
  
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 检查 model-viewer 是否已加载（可能在之前的实例中已加载）
  const isModelViewerScriptLoaded = () => {
    return typeof window !== 'undefined' && window.customElements && window.customElements.get('model-viewer') !== undefined;
  };
  
  const [modelViewerLoaded, setModelViewerLoaded] = useState(isModelViewerScriptLoaded());

  useEffect(() => {
    if (modelViewerLoaded && viewerRef.current && !isSTL) {
      const viewer = viewerRef.current;
      
      const handleLoad = () => {
        setIsLoading(false);
        setError(null);
      };

      const handleError = async (event: any) => {
        console.error('[Model3DViewer] Model viewer error:', event);
        setIsLoading(false);
        
        // 尝试获取详细错误信息
        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || '模型加载失败');
            return;
          }
        } catch (e) {
          console.error('Failed to fetch error details:', e);
        }
        
        setError('模型加载失败，文件可能已过期或格式不支持');
      };

      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);

      // 清理函数
      return () => {
        if (viewer) {
          viewer.removeEventListener('load', handleLoad);
          viewer.removeEventListener('error', handleError);
          // 清理模型资源
          try {
            viewer.src = '';
          } catch (e) {
            console.error('Failed to clear model src:', e);
          }
        }
      };
    }
  }, [modelViewerLoaded, proxyUrl, isSTL]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = `0deg 75deg ${105 / newZoom}%`;
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom * 0.8, 0.5);
    setZoom(newZoom);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = `0deg 75deg ${105 / newZoom}%`;
    }
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = `${newRotation}deg 75deg ${105 / zoom}%`;
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = '0deg 75deg 105%';
      viewerRef.current.resetTurntableRotation();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    // 如果是本地存储，添加 download 参数
    const downloadUrl = isLocalStorage 
      ? `${modelUrl}?download=1`
      : modelUrl;
    link.href = downloadUrl;
    link.download = `model.${modelType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        type="module"
        strategy="lazyOnload"
        onLoad={() => {
          setModelViewerLoaded(true);
        }}
        onError={(e) => {
          console.error('[Model3DViewer] Failed to load model-viewer script:', e);
          setError('3D查看器加载失败');
        }}
      />
      
      {/* 如果脚本已经加载过，Script组件不会再次触发onLoad，所以需要手动检查 */}
      {!modelViewerLoaded && typeof window !== 'undefined' && isModelViewerScriptLoaded() && (() => {
        setTimeout(() => setModelViewerLoaded(true), 0);
        return null;
      })()}

      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]" style={{ pointerEvents: 'auto' }}>
        <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
          {/* 标题栏 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">3D模型预览</h3>
            <div className="flex items-center gap-2">
              {showControls && (
                <>
                  <Button
                    onClick={() => {
                      console.log('[Model3DViewer] Fullscreen button clicked');
                      toggleFullscreen();
                    }}
                    variant="ghost"
                    size="sm"
                    title="全屏"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('[Model3DViewer] Download button clicked');
                      handleDownload();
                    }}
                    variant="ghost"
                    size="sm"
                    title="下载模型"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div 
            className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200"
            onClick={() => console.log('[Model3DViewer] 3D area clicked')}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">加载3D模型中...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    加载完成后可以拖拽旋转、滚轮缩放、双击重置视图
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    重新加载
                  </Button>
                </div>
              </div>
            )}

            {/* STL格式提示 */}
            {isSTL && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-center max-w-md p-6">
                  <div className="text-yellow-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">STL格式暂不支持在线预览</h4>
                  <p className="text-gray-600 mb-4">
                    STL格式需要专业的3D建模软件查看。请下载文件后使用以下软件打开：
                  </p>
                  <ul className="text-sm text-gray-500 mb-4 text-left space-y-1">
                    <li>• Blender（免费开源）</li>
                    <li>• MeshLab（免费）</li>
                    <li>• Autodesk Fusion 360</li>
                    <li>• Windows 3D Viewer（Windows系统自带）</li>
                  </ul>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleDownload} variant="default">
                      <Download className="w-4 h-4 mr-2" />
                      下载STL文件
                    </Button>
                    {onClose && (
                      <Button onClick={onClose} variant="outline">
                        关闭
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modelViewerLoaded && proxyUrl && !isSTL && (
              // @ts-ignore - model-viewer is a web component
              <model-viewer
                ref={viewerRef}
                src={proxyUrl}
                alt="3D model"
                camera-controls
                touch-action="pan-y"
                auto-rotate={autoRotate}
                shadow-intensity="1"
                ar={enableAR}
                ar-modes="webxr scene-viewer quick-look"
                interaction-policy="always-allow"
                disable-pan={false}
                disable-zoom={false}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: '#f0f0f0'
                } as React.CSSProperties}
                loading="eager"
                reveal="auto"
                exposure="1"
                shadow-softness="0.5"
                onLoad={() => {
                  console.log('[Model3DViewer] Model loaded successfully');
                  setIsLoading(false);
                }}
                onError={(e: any) => {
                  console.error('[Model3DViewer] Model load error:', e);
                  setError('模型加载失败，请检查文件格式');
                  setIsLoading(false);
                }}
              >
                {enableAR && (
                  <button
                    slot="ar-button"
                    className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Smartphone className="inline-block w-4 h-4 mr-2" />
                    AR查看
                  </button>
                )}
              </model-viewer>
            )}
          </div>

          {/* 控制栏 */}
          {showControls && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 缩放控制 */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleZoomOut}
                      variant="outline"
                      size="sm"
                      disabled={zoom <= 0.5}
                      title="缩小"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <div className="w-32">
                      <Slider
                        value={[zoom]}
                        onValueChange={([value]) => {
                          setZoom(value);
                          if (viewerRef.current) {
                            viewerRef.current.cameraOrbit = `${rotation}deg 75deg ${105 / value}%`;
                          }
                        }}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="cursor-pointer"
                      />
                    </div>
                    <Button
                      onClick={handleZoomIn}
                      variant="outline"
                      size="sm"
                      disabled={zoom >= 3}
                      title="放大"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 旋转控制 */}
                  <Button
                    onClick={handleRotate}
                    variant="outline"
                    size="sm"
                    title="旋转90度"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>

                  {/* 重置视图 */}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    title="重置视图"
                  >
                    <Move3D className="h-4 w-4" />
                  </Button>
                </div>

                {/* 提示信息 */}
                <div className="text-xs text-gray-500">
                  <Eye className="inline-block w-3 h-3 mr-1" />
                  鼠标拖动旋转 · 滚轮缩放 · 双击重置
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}