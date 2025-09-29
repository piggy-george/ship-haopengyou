'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Users, X } from 'lucide-react';

interface QueueInfo {
  position?: number;
  totalInQueue?: number;
  estimatedTime?: number;
  isPeakPeriod?: boolean;
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  queueInfo?: QueueInfo;
  errorMessage?: string;
}

export function ProgressModal({
  isOpen,
  onClose,
  onCancel,
  status,
  queueInfo,
  errorMessage
}: ProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // 动画效果
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    }
  }, [status]);

  // 加载动画点
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return `排队中${dots}`;
      case 'processing':
        return `正在生成3D模型${dots}`;
      case 'completed':
        return '生成完成！';
      case 'failed':
        return '生成失败';
      default:
        return '处理中';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '计算中...';
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>3D模型生成中</span>
            {onCancel && status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 主状态显示 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className={`w-16 h-16 ${status === 'processing' ? 'animate-spin' : ''} text-blue-500`} />
              {status === 'completed' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold">{getStatusText()}</h3>
          </div>

          {/* 进度条 */}
          {(status === 'processing' || status === 'completed') && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">{Math.round(progress)}%</p>
            </div>
          )}

          {/* 队列信息 */}
          {status === 'pending' && queueInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">队列位置</span>
                </div>
                <span className="text-sm font-semibold">
                  {queueInfo.position || 0} / {queueInfo.totalInQueue || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">预计等待</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatTime(queueInfo.estimatedTime)}
                </span>
              </div>

              {queueInfo.isPeakPeriod && (
                <div className="text-xs text-orange-600 bg-orange-50 rounded p-2 text-center">
                  🔥 当前为高峰期，等待时间可能略长
                </div>
              )}
            </div>
          )}

          {/* 处理中提示 */}
          {status === 'processing' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 text-center">
                AI正在努力生成您的3D模型，通常需要30-90秒
              </p>
            </div>
          )}

          {/* 错误信息 */}
          {status === 'failed' && errorMessage && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-700 text-center">{errorMessage}</p>
            </div>
          )}

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 text-center">
            请不要关闭此窗口，生成完成后将自动显示结果
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}