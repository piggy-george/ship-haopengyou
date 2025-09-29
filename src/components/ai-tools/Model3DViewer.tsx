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
  // 使用代理URL避免CORS问题
  const proxyUrl = modelUrl && (modelUrl.includes('tencentcos.cn') || modelUrl.includes('cos.ap-'))
    ? `/api/proxy/3d-model?url=${encodeURIComponent(modelUrl)}`
    : modelUrl || '';
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  useEffect(() => {
    if (modelViewerLoaded && viewerRef.current) {
      const viewer = viewerRef.current;
      console.log('[Model3DViewer] Initializing model-viewer with URL:', proxyUrl);
      
      const handleLoad = () => {
        console.log('[Model3DViewer] Model loaded successfully');
        setIsLoading(false);
        setError(null);
      };

      const handleError = (event: any) => {
        console.error('[Model3DViewer] Model viewer error:', event);
        setIsLoading(false);
        setError('模型加载失败，请检查网络连接');
      };

      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);

      // 清理函数
      return () => {
        if (viewer) {
          viewer.removeEventListener('load', handleLoad);
          viewer.removeEventListener('error', handleError);
        }
      };
    }
  }, [modelViewerLoaded, proxyUrl]);

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
    link.href = modelUrl;
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
          console.log('[Model3DViewer] model-viewer script loaded');
          setModelViewerLoaded(true);
        }}
        onError={(e) => {
          console.error('[Model3DViewer] Failed to load model-viewer script:', e);
          setError('3D查看器加载失败');
        }}
      />

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
                  onClick={() => {
                    console.log('[Model3DViewer] Close button clicked');
                    onClose();
                  }}
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

            {modelViewerLoaded && proxyUrl && (
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