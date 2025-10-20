'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, ShoppingCart, Gift, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  required: number;
  shortage: number;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  currentBalance,
  required,
  shortage
}: InsufficientCreditsModalProps) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>{t('credits.insufficient_title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('credits.insufficient_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 积分状态 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('credits.current_balance')}:</span>
                  <span className="font-semibold text-gray-900">{currentBalance} {t('credits.credits')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('credits.required')}:</span>
                  <span className="font-semibold text-gray-900">{required} {t('credits.credits')}</span>
                </div>
                <div className="h-px bg-amber-200 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700 font-medium">{t('credits.shortage')}:</span>
                  <span className="font-bold text-amber-700">{shortage} {t('credits.credits')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 获取积分方式 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('credits.get_more_credits')}
            </h4>

            {/* 邀请好友 */}
            <Link
              href="/my-invites"
              onClick={onClose}
              className="block p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900">
                    {t('credits.invite_friends')}
                  </div>
                  <div className="text-xs text-blue-700">
                    {t('credits.invite_reward_desc')}
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </Link>

            {/* 充值积分（预留） */}
            <div className="block p-3 bg-gray-100 border border-gray-300 rounded-lg opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {t('credits.purchase_credits')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t('credits.coming_soon')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {t('common.close')}
            </Button>
            <Link href="/my-invites" className="flex-1">
              <Button
                onClick={onClose}
                className="w-full flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                {t('credits.invite_now')}
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
