'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Gift, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

interface CreditsDisplayProps {
  showDetails?: boolean;
}

export function CreditsDisplay({ showDetails = true }: CreditsDisplayProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchCreditsData();
  }, []);

  const fetchCreditsData = async () => {
    try {
      setLoading(true);
      // 使用 ShipAny 原生 API
      const response = await fetch('/api/get-user-credits', {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 未登录，不显示
          return;
        }
        throw new Error('获取积分信息失败');
      }

      const result = await response.json();
      // ShipAny API 返回格式: { code: 0, data: { left_credits: number } }
      if (result.code === 0 && result.data) {
        setCredits(result.data.left_credits || 0);
        // ShipAny 原生 API 不返回交易历史，暂时设置为空数组
        setRecentTransactions([]);
      } else {
        throw new Error(result.msg || '获取积分信息失败');
      }
    } catch (error: any) {
      console.error('获取积分失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || credits === null) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* 左侧：积分余额 */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('credits.your_balance')}</p>
                  <p className="text-3xl font-bold text-gray-900">{credits.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{t('credits.credits')}</p>
                </div>
              </div>

              {/* 最近消耗统计 */}
              {showDetails && recentTransactions.length > 0 && (
                <div className="hidden md:flex items-center gap-4 pl-6 border-l border-amber-300">
                  <div>
                    <p className="text-xs text-gray-500">{t('credits.recent_consumption')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {recentTransactions.slice(0, 3).map((tx, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-gray-400" />
                          <span className={`text-sm font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-3">
              <Link href="/my-invites">
                <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-amber-50">
                  <Gift className="w-4 h-4" />
                  {t('credits.earn_credits')}
                </Button>
              </Link>

              <Link href="/my-credits">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                  {t('credits.view_history')}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
