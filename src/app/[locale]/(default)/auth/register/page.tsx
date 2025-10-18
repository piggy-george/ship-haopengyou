'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.password_mismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('register.register_failed'));
      }

      toast.success(t('register.register_success'));
      router.push('/auth/signin');
    } catch (error: any) {
      toast.error(error.message || t('register.register_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('register.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('register.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email_label')} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('register.email_placeholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">{t('register.username_label')}</Label>
              <Input
                id="nickname"
                type="text"
                placeholder={t('register.username_placeholder')}
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">{t('register.username_tip')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password_label')} *</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('register.password_placeholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirm_password_label')} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('register.confirm_password_placeholder')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('register.registering')}
                </>
              ) : (
                t('register.register_button')
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('register.login_link').split('?')[0]}?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                {t('register.login_link').split('?')[1]}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
