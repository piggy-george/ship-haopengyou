'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import Image from 'next/image'

interface Post {
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
  isAiGenerated: boolean
  aiPrompt?: string
  generationCost?: number
  status: string
  views: number
  likes: number
  comments: number
  shares: number
  createdAt: string
  updatedAt: string
}

export function PostModerationPanel() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [filter, setFilter] = useState<'pending' | 'published' | 'rejected' | 'all'>('pending')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/community/posts?filter=${filter}&limit=50`)
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postUuid: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' }),
      })

      if (response.ok) {
        fetchPosts()
        setSelectedPost(null)
        alert('作品已发布')
      } else {
        const data = await response.json()
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('Failed to approve post:', error)
      alert('操作失败')
    }
  }

  const handleReject = async () => {
    if (!selectedPost) return

    try {
      const response = await fetch(`/api/community/posts/${selectedPost.uuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectReason: rejectReason.trim()
        }),
      })

      if (response.ok) {
        fetchPosts()
        setSelectedPost(null)
        setShowRejectDialog(false)
        setRejectReason('')
        alert('作品已拒绝')
      } else {
        const data = await response.json()
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('Failed to reject post:', error)
      alert('操作失败')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />待审核</Badge>
      case 'published':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已发布</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>
      case 'draft':
        return <Badge variant="outline">草稿</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFilterCount = (filterType: string) => {
    return posts.filter(post => filterType === 'all' || post.status === filterType).length
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">待审核</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">已发布</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">已拒绝</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">总浏览量</p>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.views, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选标签 */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="pending">待审核</TabsTrigger>
          <TabsTrigger value="published">已发布</TabsTrigger>
          <TabsTrigger value="rejected">已拒绝</TabsTrigger>
          <TabsTrigger value="all">全部</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无内容</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.uuid} className="hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <Image
                      src={post.images[0] || '/placeholder-post.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(post.status)}
                    </div>
                    {post.isAiGenerated && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-500">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                        {post.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{post.author.displayName}</span>
                        <Calendar className="w-3 h-3 ml-2" />
                        <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.views} 浏览</span>
                        <span>{post.likes} 点赞</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPost(post)}
                          className="flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          详情
                        </Button>
                        {post.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(post.uuid)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedPost(post)
                                setShowRejectDialog(true)
                              }}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 详情弹窗 */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPost.title}
                {getStatusBadge(selectedPost.status)}
              </DialogTitle>
              <DialogDescription>
                由 {selectedPost.author.displayName} 创作于{' '}
                {new Date(selectedPost.createdAt).toLocaleString('zh-CN')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* 图片展示 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedPost.images.map((image, index) => (
                  <div key={index} className="aspect-square relative">
                    <Image
                      src={image}
                      alt={`图片 ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* 内容描述 */}
              {selectedPost.content && (
                <div>
                  <h4 className="font-medium mb-2">作品描述</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              )}

              {/* AI信息 */}
              {selectedPost.isAiGenerated && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI生成信息
                  </h4>
                  {selectedPost.aiPrompt && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">提示词：</p>
                      <p className="text-sm">{selectedPost.aiPrompt}</p>
                    </div>
                  )}
                  {selectedPost.generationCost && (
                    <p className="text-xs text-muted-foreground">
                      消耗积分：{selectedPost.generationCost}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedPost.status === 'pending' && (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPost.uuid)}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    通过
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 拒绝确认弹窗 */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              拒绝作品
            </AlertDialogTitle>
            <AlertDialogDescription>
              请说明拒绝这个作品的原因，这将帮助作者改进。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="请输入拒绝原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600"
            >
              确认拒绝
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}