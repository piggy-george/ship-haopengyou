'use client'

import { ImageGenerator } from '@/components/ai-tools/ImageGenerator'
import { GenerationHistory } from '@/components/ai-tools/GenerationHistory'
import { LoginRequired } from '@/components/auth/LoginRequired'

export default function TextToImagePage() {
  return (
    <LoginRequired 
      title="文生图创作"
      description="请登录后使用文生图功能"
    >
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
    </LoginRequired>
  )
}