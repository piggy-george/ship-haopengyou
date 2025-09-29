'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft, MessageSquare } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  error: {
    code?: string;
    message: string;
    details?: string;
    suggestion?: string;
  };
}

export function ErrorModal({
  isOpen,
  onClose,
  onRetry,
  error
}: ErrorModalProps) {
  const getErrorTitle = () => {
    switch (error.code) {
      case 'INSUFFICIENT_CREDITS':
        return '积分不足';
      case 'INVALID_IMAGE':
        return '图片格式错误';
      case 'API_ERROR':
        return 'API服务异常';
      case 'NETWORK_ERROR':
        return '网络连接失败';
      case 'QUEUE_FULL':
        return '服务器繁忙';
      case 'TIMEOUT':
        return '请求超时';
      default:
        return '生成失败';
    }
  };

  const getErrorIcon = () => {
    switch (error.code) {
      case 'INSUFFICIENT_CREDITS':
        return '💰';
      case 'INVALID_IMAGE':
        return '🖼️';
      case 'NETWORK_ERROR':
        return '🌐';
      case 'QUEUE_FULL':
        return '⏳';
      case 'TIMEOUT':
        return '⏱️';
      default:
        return '❌';
    }
  };

  const getErrorSuggestion = () => {
    if (error.suggestion) return error.suggestion;

    switch (error.code) {
      case 'INSUFFICIENT_CREDITS':
        return '请充值积分后继续使用，或选择消耗积分较少的生成选项。';
      case 'INVALID_IMAGE':
        return '请确保上传的图片为JPG/PNG格式，文件大小不超过10MB。';
      case 'API_ERROR':
        return '服务暂时不可用，请稍后重试或联系客服。';
      case 'NETWORK_ERROR':
        return '请检查网络连接，或稍后重试。';
      case 'QUEUE_FULL':
        return '当前用户较多，请稍后重试或选择其他生成模式。';
      case 'TIMEOUT':
        return '生成时间过长，请减少模型复杂度或稍后重试。';
      default:
        return '请稍后重试，如问题持续，请联系客服支持。';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{getErrorIcon()}</span>
            <span>{getErrorTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 错误信息 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {error.message}
                </p>
                {error.details && (
                  <p className="text-xs text-red-600 mt-1">
                    错误详情: {error.details}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 建议 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              解决建议
            </h4>
            <p className="text-sm text-blue-700">
              {getErrorSuggestion()}
            </p>
          </div>

          {/* 错误代码 */}
          {error.code && (
            <div className="text-xs text-gray-500 text-center">
              错误代码: {error.code}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {onRetry && (
              <Button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="flex-1 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
          </div>

          {/* 联系客服 */}
          {(error.code === 'API_ERROR' || error.code === 'TIMEOUT') && (
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2 text-sm"
              onClick={() => {
                // TODO: 实现客服对话
                window.open('/support', '_blank');
              }}
            >
              <MessageSquare className="w-4 h-4" />
              联系客服支持
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}