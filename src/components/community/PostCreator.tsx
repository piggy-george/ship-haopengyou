'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Package,
  Save,
  Send
} from 'lucide-react'
import Image from 'next/image'

interface PostCreatorProps {
  onSuccess: (post: any) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
}

export function PostCreator({ onSuccess, isSubmitting, setIsSubmitting }: PostCreatorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    videoUrl: '',
    productUuid: '',
    isAiGenerated: false,
    aiPrompt: '',
    generationCost: 0
  })

  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          alert(`文件 ${file.name} 不是有效的图片格式`)
          continue
        }

        // 验证文件大小（最大10MB）
        if (file.size > 10 * 1024 * 1024) {
          alert(`文件 ${file.name} 超过10MB大小限制`)
          continue
        }

        // 创建FormData上传文件
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'community')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
        } else {
          alert(`上传 ${file.name} 失败`)
        }
      }

      // 更新图片列表
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, 9) // 最多9张图片
      }))

    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (isDraft = false) => {
    // 验证必填字段
    if (!formData.title.trim()) {
      alert('请填写作品标题')
      return
    }

    if (formData.images.length === 0) {
      alert('请至少上传一张图片')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          isDraft
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        onSuccess(data.post)
      } else {
        alert(data.error || '提交失败，请重试')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          创作分享
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 作品标题 */}
        <div className="space-y-2">
          <Label htmlFor="title">作品标题 *</Label>
          <Input
            id="title"
            placeholder="给你的作品起个响亮的名字..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={100}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            {formData.title.length}/100
          </p>
        </div>

        {/* 作品描述 */}
        <div className="space-y-2">
          <Label htmlFor="content">作品描述</Label>
          <Textarea
            id="content"
            placeholder="介绍一下你的创作理念、设计思路或制作过程..."
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            maxLength={2000}
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            {formData.content.length}/2000
          </p>
        </div>

        {/* 图片上传 */}
        <div className="space-y-4">
          <Label>作品图片 *</Label>

          {/* 图片列表 */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`作品图片 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 上传按钮 */}
          {formData.images.length < 9 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(e.target.files)
                  }
                }}
                disabled={isSubmitting || uploadingImages}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || uploadingImages}
                className="w-full border-dashed"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    选择图片 ({formData.images.length}/9)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                支持JPG、PNG格式，单张最大10MB，最多上传9张图片
              </p>
            </div>
          )}
        </div>

        {/* AI生成信息 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-generated">这是AI生成的作品吗？</Label>
            <Switch
              id="ai-generated"
              checked={formData.isAiGenerated}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, isAiGenerated: checked }))
              }
              disabled={isSubmitting}
            />
          </div>

          {formData.isAiGenerated && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">AI提示词</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="分享你使用的AI提示词..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="generation-cost">生成消耗积分</Label>
                <Input
                  id="generation-cost"
                  type="number"
                  placeholder="0"
                  value={formData.generationCost || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    generationCost: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>

        {/* 关联商品 */}
        <div className="space-y-2">
          <Label htmlFor="product">关联商品（可选）</Label>
          <div className="flex gap-2">
            <Input
              id="product"
              placeholder="商品ID或链接"
              value={formData.productUuid}
              onChange={(e) => setFormData(prev => ({ ...prev, productUuid: e.target.value }))}
              disabled={isSubmitting}
            />
            <Button variant="outline" size="sm" disabled={isSubmitting}>
              <Package className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            关联商品后，用户可以直接从你的作品跳转到定制页面
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || uploadingImages}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || uploadingImages || formData.images.length === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                发布作品
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• 发布的作品将进入审核队列，审核通过后会在社区展示</p>
          <p>• 请确保上传的内容符合社区规范，避免涉及敏感内容</p>
          <p>• 草稿可以随时编辑，发布后的作品需要重新审核才能修改</p>
        </div>
      </CardContent>
    </Card>
  )
}