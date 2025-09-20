'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InteractionBar } from './InteractionBar'
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface CommunityPost {
  uuid: string
  title: string
  content: string
  images: string[]
  author: {
    uuid: string
    displayName: string
    avatar: string
    verified: boolean
  }
  product?: {
    uuid: string
    name: string
    basePrice: number
  }
  isAiGenerated: boolean
  aiPrompt?: string
  generationCost?: number
  views: number
  likes: number
  comments: number
  shares: number
  featured: boolean
  createdAt: string
  tags?: string[]
}

export function PostGrid() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ai' | 'featured'>('all')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/community/posts?filter=${filter}&limit=20`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch community posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInteraction = async (postUuid: string, type: 'like' | 'share') => {
    try {
      const response = await fetch('/api/community/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUuid, type }),
      })

      if (response.ok) {
        // 更新本地状态
        setPosts(prev => prev.map(post =>
          post.uuid === postUuid
            ? {
                ...post,
                [type === 'like' ? 'likes' : 'shares']: post[type === 'like' ? 'likes' : 'shares'] + 1
              }
            : post
        ))
      }
    } catch (error) {
      console.error('Failed to interact with post:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          全部作品
        </Button>
        <Button
          variant={filter === 'ai' ? 'default' : 'outline'}
          onClick={() => setFilter('ai')}
        >
          AI创作
        </Button>
        <Button
          variant={filter === 'featured' ? 'default' : 'outline'}
          onClick={() => setFilter('featured')}
        >
          精选推荐
        </Button>
      </div>

      {/* 作品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.uuid} className="group hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={post.images[0] || '/placeholder-post.jpg'}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* 标签 */}
              <div className="absolute top-2 left-2 flex gap-1">
                {post.featured && (
                  <Badge className="bg-yellow-500">精选</Badge>
                )}
                {post.isAiGenerated && (
                  <Badge className="bg-purple-500">AI创作</Badge>
                )}
              </div>

              {/* 浏览量 */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views}
              </div>

              {/* 作者信息覆盖层 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-2 text-white">
                  <Image
                    src={post.author.avatar || '/placeholder-avatar.jpg'}
                    alt={post.author.displayName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-sm font-medium">{post.author.displayName}</span>
                  {post.author.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* 标题和内容 */}
                <div>
                  <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                  {post.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.content}
                    </p>
                  )}
                </div>

                {/* AI生成信息 */}
                {post.isAiGenerated && post.aiPrompt && (
                  <div className="bg-purple-50 p-2 rounded-md">
                    <p className="text-xs text-purple-700 line-clamp-2">
                      🤖 &quot;{post.aiPrompt}&quot;
                    </p>
                    {post.generationCost && (
                      <p className="text-xs text-purple-600 mt-1">
                        消耗 {post.generationCost} 积分
                      </p>
                    )}
                  </div>
                )}

                {/* 关联商品 */}
                {post.product && (
                  <div className="bg-blue-50 p-2 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{post.product.name}</span>
                      <span className="text-sm text-blue-600">¥{post.product.basePrice}</span>
                    </div>
                    <Link href={`/customize/${post.product.uuid}`}>
                      <Button size="sm" className="w-full mt-2">
                        立即定制
                      </Button>
                    </Link>
                  </div>
                )}

                {/* 互动栏 */}
                <InteractionBar
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  onLike={() => handleInteraction(post.uuid, 'like')}
                  onShare={() => handleInteraction(post.uuid, 'share')}
                  onComment={() => {
                    // 跳转到作品详情页
                    window.location.href = `/community/post/${post.uuid}`
                  }}
                />

                <div className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无作品</p>
        </div>
      )}
    </div>
  )
}