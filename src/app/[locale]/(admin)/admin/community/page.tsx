import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PostModerationPanel } from '@/components/admin/PostModerationPanel'
import { getTranslations } from 'next-intl/server'

export default async function CommunityAdminPage() {
  const session = await auth()
  const t = await getTranslations('admin.community')

  // 检查管理员权限
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <PostModerationPanel />
    </div>
  )
}