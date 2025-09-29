'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ARViewerProps {
  modelUrl: string;
  onClose: () => void;
}

export function ARViewer({ modelUrl, onClose }: ARViewerProps) {
  // 使用代理URL避免CORS问题
  const proxyUrl = modelUrl && (modelUrl.includes('tencentcos.cn') || modelUrl.includes('cos.ap-'))
    ? `/api/proxy/3d-model?url=${encodeURIComponent(modelUrl)}`
    : modelUrl || '';
  
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    if ('xr' in navigator) {
      try {
        const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
        setIsARSupported(isSupported || false);
      } catch (error) {
        console.error('AR support check failed:', error);
        setIsARSupported(false);
      }
    } else {
      setIsARSupported(false);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <p className="text-center">检测AR功能支持中...</p>
        </div>
      </div>
    );
  }

  if (!isARSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AR不可用</h3>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              您的设备或浏览器不支持AR功能。请使用支持WebXR的浏览器在移动设备上体验。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">AR体验建议:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>使用iOS设备上的Safari浏览器</li>
                <li>使用Android设备上的Chrome浏览器</li>
                <li>确保设备支持ARCore(Android)或ARKit(iOS)</li>
              </ul>
            </div>
            <Button onClick={onClose} className="w-full">
              关闭
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div className="relative w-full h-full">
        {/* @ts-ignore - model-viewer is a web component */}
        <model-viewer
          src={proxyUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          style={{ width: '100%', height: '100%' }}
        >
          <button
            slot="ar-button"
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            开始AR体验
          </button>
          {/* @ts-ignore */}
        </model-viewer>

        <Button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm">
          点击按钮进入AR模式
        </div>
      </div>
    </div>
  );
}