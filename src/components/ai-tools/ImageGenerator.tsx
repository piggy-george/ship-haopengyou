'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Download, ShoppingCart } from 'lucide-react'

const styles = [
  { value: 'realistic', label: '写实风格' },
  { value: 'anime', label: '动漫风格' },
  { value: 'oil-painting', label: '油画风格' },
  { value: 'watercolor', label: '水彩风格' },
  { value: 'sketch', label: '素描风格' },
  { value: 'digital-art', label: '数字艺术' }
]

const qualities = [
  { value: 'standard', label: '标准 (10积分)', cost: 10 },
  { value: 'high', label: '高清 (20积分)', cost: 20 },
  { value: 'ultra', label: '超高清 (40积分)', cost: 40 }
]

const aspectRatios = [
  { value: '1:1', label: '正方形 (1:1)' },
  { value: '16:9', label: '横屏 (16:9)' },
  { value: '9:16', label: '竖屏 (9:16)' }
]

interface GeneratedImage {
  url: string
  prompt: string
  recordId: string
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [quality, setQuality] = useState('standard')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [count, setCount] = useState(2)
  const [generating, setGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState('')

  const selectedQuality = qualities.find(q => q.value === quality)
  const totalCost = (selectedQuality?.cost || 10) * count

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入生成提示词')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ai/generate/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          style,
          quality,
          aspectRatio,
          count
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      const newImages = data.images.map((url: string) => ({
        url,
        prompt,
        recordId: data.recordId
      }))

      setImages(newImages)
    } catch (error) {
      setError(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI文生图创作工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">创作提示词 *</Label>
            <Textarea
              id="prompt"
              placeholder="描述您想要生成的图片，比如：一只可爱的小猫坐在彩虹桥上，背景是星空..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="negative-prompt">负面提示词 (可选)</Label>
            <Textarea
              id="negative-prompt"
              placeholder="描述您不希望出现的元素，比如：模糊、低质量、变形..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>艺术风格</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>图片质量</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>画面比例</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ar) => (
                    <SelectItem key={ar.value} value={ar.value}>
                      {ar.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>生成数量</Label>
              <Select value={count.toString()} onValueChange={(value) => setCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1张</SelectItem>
                  <SelectItem value="2">2张</SelectItem>
                  <SelectItem value="3">3张</SelectItem>
                  <SelectItem value="4">4张</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              消耗积分: {totalCost}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="min-w-[120px]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                '开始生成'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                      <Button size="sm" variant="secondary">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        定制
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}