import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const t = await getTranslations('common')

  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  )
}