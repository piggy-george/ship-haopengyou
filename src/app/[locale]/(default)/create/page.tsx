'use client'

import { useSession } from 'next-auth/react'
import { useAppContext } from '@/contexts/app'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, Camera, Box } from 'lucide-react'
import { useEffect } from 'react'

export default function CreatePage() {
  const { data: session } = useSession()
  const { setShowSignModal } = useAppContext()

  useEffect(() => {
    if (!session) {
      setShowSignModal(true)
    }
  }, [session, setShowSignModal])

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI创作中心</h1>
        <p className="text-lg text-muted-foreground">
          选择您的创作工具，让AI帮您实现创意
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>文生图</CardTitle>
            <CardDescription>
              通过文字描述生成精美图片，支持多种艺术风格
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/text-to-image">
              <Button className="w-full">开始创作</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>图生图</CardTitle>
            <CardDescription>
              基于现有图片进行风格转换、局部编辑和优化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/image-to-image">
              <Button className="w-full">开始编辑</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>3D建模</CardTitle>
            <CardDescription>
              将2D图片转换为3D模型，支持文字描述生成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/create/text-to-3d">
              <Button className="w-full">生成模型</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">积分消耗说明</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">文生图</h3>
            <p className="text-blue-600">10-40积分/次</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">图生图</h3>
            <p className="text-green-600">15-30积分/次</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">3D建模</h3>
            <p className="text-purple-600">50-200积分/次</p>
          </div>
        </div>
      </div>
    </div>
  )
}