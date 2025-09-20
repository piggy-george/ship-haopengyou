import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import { PostGrid } from '@/components/community/PostGrid'
import { CreatorShowcase } from '@/components/community/CreatorShowcase'
import { TrendingTags } from '@/components/community/TrendingTags'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { PlusCircle, Sparkles } from 'lucide-react'

export default async function CommunityPage() {
  const session = await auth()
  const t = await getTranslations('community')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">好朋友社区</h1>
            <p className="text-lg text-muted-foreground">
              分享您的AI创作，发现优秀的设计师和作品
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/community/create">
              <Button size="lg" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                分享作品
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <CreatorShowcase />
          <TrendingTags />
        </aside>

        <main className="lg:col-span-3">
          <PostGrid />
        </main>
      </div>
    </div>
  )
}