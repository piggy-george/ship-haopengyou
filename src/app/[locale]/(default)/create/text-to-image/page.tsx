'use client'

import { useSession } from 'next-auth/react'
import { useAppContext } from '@/contexts/app'
import { ImageGenerator } from '@/components/ai-tools/ImageGenerator'
import { GenerationHistory } from '@/components/ai-tools/GenerationHistory'
import { useEffect } from 'react'

export default function TextToImagePage() {
  const { data: session } = useSession()
  const { setShowSignModal } = useAppContext()

  useEffect(() => {
    if (!session) {
      setShowSignModal(true)
    }
  }, [session, setShowSignModal])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">文生图创作</h1>
        <p className="text-muted-foreground">
          输入描述文字，AI将为您生成精美的图片作品
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageGenerator />
        </div>
        <div>
          <GenerationHistory type="text2img" />
        </div>
      </div>
    </div>
  )
}