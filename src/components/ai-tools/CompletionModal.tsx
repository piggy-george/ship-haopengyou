'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, Smartphone, Share2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ModelFile {
  type: string;
  url: string;
  previewImageUrl?: string;
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelData: {
    recordId: string;
    files: ModelFile[];
    creditsUsed: number;
    prompt?: string;
    expiresAt?: string;
    type?: string; // 'text23d' | 'img23d'
    multiViewCount?: number; // 多视图数量
  };
  onPreview?: (url: string) => void;
  onARPreview?: (url: string) => void;
}

export function CompletionModal({
  isOpen,
  onClose,
  modelData,
  onPreview,
  onARPreview
}: CompletionModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (file: ModelFile) => {
    setDownloading(true);
    try {
      // 使用代理URL下载，避免CORS问题
      const downloadUrl = file.url && (file.url.includes('tencentcos.cn') || file.url.includes('cos.ap-'))
        ? `/api/proxy/3d-model?url=${encodeURIComponent(file.url)}`
        : file.url || '';
      
      // 生成友好的文件名
      const timestamp = new Date().getTime();
      const shortId = modelData.recordId?.slice(0, 8) || 'model';
      
      // 根据生成类型构建文件名
      let filename = '';
      if (modelData.type === 'text23d') {
        // 文生3D：使用提示词前10个字符
        const promptPrefix = modelData.prompt 
          ? modelData.prompt.substring(0, 10).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '_')
          : 'text';
        filename = `3d_text_${promptPrefix}_${shortId}.${file.type.toLowerCase()}`;
      } else if (modelData.multiViewCount && modelData.multiViewCount > 0) {
        // 多视图图生3D
        filename = `3d_multiview_${modelData.multiViewCount}views_${shortId}.${file.type.toLowerCase()}`;
      } else {
        // 单图生3D
        filename = `3d_image_${shortId}.${file.type.toLowerCase()}`;
      }
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('下载已开始');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const handleShare = async (file: ModelFile) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的3D模型',
          text: modelData.prompt || '查看我生成的3D模型',
          url: file.url
        });
      } catch (error) {
        console.log('分享取消或失败');
      }
    } else {
      handleCopyLink(file.url);
    }
  };

  const formatExpiryTime = (expiresAt?: string) => {
    if (!expiresAt) return '7天';
    const expires = new Date(expiresAt);
    const now = new Date();
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${days}天`;
  };

  const primaryFile = modelData.files?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">🎉</span>
            3D模型生成完成！
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 预览图 */}
          {primaryFile?.previewImageUrl && (
            <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
              <img
                src={primaryFile.previewImageUrl}
                alt="模型预览"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                {primaryFile.type}
              </div>
            </div>
          )}

          {/* 生成信息 */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">消耗积分</span>
              <span className="font-semibold">{modelData.creditsUsed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">文件格式</span>
              <span className="font-semibold">{modelData.files.map(f => f.type).join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">有效期</span>
              <span className="font-semibold">{formatExpiryTime(modelData.expiresAt)}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 主要操作 */}
            <div className="grid grid-cols-2 gap-3">
              {primaryFile && (
                <>
                  <Button
                    onClick={() => handleDownload(primaryFile)}
                    disabled={downloading}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? '下载中...' : '下载模型'}
                  </Button>

                  {onPreview && (
                    <Button
                      onClick={() => onPreview(primaryFile.url)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      3D预览
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* 次要操作 */}
            <div className="grid grid-cols-2 gap-3">
              {primaryFile && onARPreview && (
                <Button
                  onClick={() => onARPreview(primaryFile.url)}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Smartphone className="w-4 h-4" />
                  AR体验
                </Button>
              )}

              {primaryFile && (
                <Button
                  onClick={() => handleShare(primaryFile)}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                  分享
                </Button>
              )}
            </div>

            {/* 复制链接 */}
            {primaryFile && (
              <Button
                onClick={() => handleCopyLink(primaryFile.url)}
                variant="ghost"
                className="w-full flex items-center gap-2 text-sm"
                size="sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    已复制链接
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制下载链接
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>文件将在{formatExpiryTime(modelData.expiresAt)}后过期，请及时下载保存</p>
            <p>您可以在页面右上角"我的数字资产"中查看所有生成记录</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}