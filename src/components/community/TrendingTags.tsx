'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Hash } from 'lucide-react'

interface TrendingTag {
  tag: string
  count: number
  growth: number // 增长百分比
}

export function TrendingTags() {
  const [tags, setTags] = useState<TrendingTag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingTags()
  }, [])

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch('/api/community/tags/trending?limit=15')
      const data = await response.json()

      if (response.ok) {
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tag: string) => {
    // 跳转到带有该标签的作品列表
    window.location.href = `/community?tag=${encodeURIComponent(tag)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>热门标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-6 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          热门标签
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">暂无热门标签</p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleTagClick(tag.tag)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{tag.tag}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {tag.count}
                  </span>
                  {tag.growth > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tag.growth}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 点击标签查看相关作品</p>
            <p>📈 数字表示本周使用次数</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}