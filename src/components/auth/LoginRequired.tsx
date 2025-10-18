'use client';

import { useSession } from 'next-auth/react';
import { useAppContext } from '@/contexts/app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';

interface LoginRequiredProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function LoginRequired({ children, title, description }: LoginRequiredProps) {
  const { data: session, status } = useSession();
  const { setShowSignModal } = useAppContext();
  const t = useTranslations();

  // 自动显示登录弹窗
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowSignModal(true);
    }
  }, [status, setShowSignModal]);

  // 加载中状态
  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('auth.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态 - 显示登录要求页面
  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">
                {title || t('auth.login_required')}
              </CardTitle>
              <CardDescription>
                {description || t('auth.login_required_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('auth.login_required_message')}
              </p>
              <Button 
                onClick={() => setShowSignModal(true)}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('auth.login_now')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 已登录 - 显示正常内容
  return <>{children}</>;
}
