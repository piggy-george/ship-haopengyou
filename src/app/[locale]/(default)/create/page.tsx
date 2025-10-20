'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, Camera, Box } from 'lucide-react'
import { LoginRequired } from '@/components/auth/LoginRequired'
import { useTranslations } from 'next-intl'
import { CreditsDisplay } from '@/components/credits/CreditsDisplay'

export default function CreatePage() {
  const t = useTranslations('create')

  return (
    <LoginRequired
      title={t('page_title')}
      description={t('page_description')}
    >
    <div className="container mx-auto py-8">
      {/* 积分余额显示 */}
      <CreditsDisplay showDetails={true} />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('page_title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('page_subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>{t('text_to_image.title')}</CardTitle>
            <CardDescription>
              {t('text_to_image.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/text-to-image">
              <Button className="w-full">{t('text_to_image.button')}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>{t('image_to_image.title')}</CardTitle>
            <CardDescription>
              {t('image_to_image.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/image-to-image">
              <Button className="w-full">{t('image_to_image.button')}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>{t('text_to_3d.title')}</CardTitle>
            <CardDescription>
              {t('text_to_3d.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/text-to-3d">
              <Button className="w-full">{t('text_to_3d.button')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">{t('credits.title')}</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">{t('credits.text_to_image')}</h3>
            <p className="text-blue-600">{t('credits.text_to_image_cost')}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">{t('credits.image_to_image')}</h3>
            <p className="text-green-600">{t('credits.image_to_image_cost')}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">{t('credits.text_to_3d')}</h3>
            <p className="text-purple-600">{t('credits.text_to_3d_cost')}</p>
          </div>
        </div>
      </div>
    </div>
    </LoginRequired>
  )
}