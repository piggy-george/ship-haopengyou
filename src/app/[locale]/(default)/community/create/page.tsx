'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAppContext } from '@/contexts/app'
import { useRouter } from 'next/navigation'
import { PostCreator } from '@/components/community/PostCreator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useEffect } from 'react'

export default function CreatePostPage() {
  const { data: session } = useSession()
  const { setShowSignModal } = useAppContext()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!session) {
      setShowSignModal(true)
    }
  }, [session, setShowSignModal])

  const handlePostCreated = (post: any) => {
    // 创建成功后跳转到社区页面
    router.push('/community')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/community">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回社区
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">分享你的作品</h1>
            <p className="text-muted-foreground">
              展示你的AI创作，与好朋友们分享你的创意
            </p>
          </div>
        </div>

        {/* 作品创建表单 */}
        <PostCreator
          onSuccess={handlePostCreated}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </div>
    </div>
  )
}