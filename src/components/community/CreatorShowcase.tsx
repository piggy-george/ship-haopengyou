'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, Award } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface FeaturedCreator {
  uuid: string
  displayName: string
  avatar: string
  bio: string
  verified: boolean
  level: number
  totalDesigns: number
  totalSales: number
  rating: number
  followers: number
  storeSlug?: string
}

export function CreatorShowcase() {
  const [creators, setCreators] = useState<FeaturedCreator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCreators()
  }, [])

  const fetchFeaturedCreators = async () => {
    try {
      const response = await fetch('/api/community/creators/featured?limit=5')
      const data = await response.json()

      if (response.ok) {
        setCreators(data.creators || [])
      }
    } catch (error) {
      console.error('Failed to fetch featured creators:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level: number) => {
    if (level >= 5) return { text: '大师', color: 'bg-purple-500' }
    if (level >= 4) return { text: '专家', color: 'bg-blue-500' }
    if (level >= 3) return { text: '高手', color: 'bg-green-500' }
    if (level >= 2) return { text: '熟练', color: 'bg-yellow-500' }
    return { text: '新手', color: 'bg-gray-500' }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>优秀创作者</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
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
          <Award className="w-5 h-5" />
          优秀创作者
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creators.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">暂无推荐创作者</p>
        ) : (
          <div className="space-y-4">
            {creators.map((creator) => {
              const levelBadge = getLevelBadge(creator.level)

              return (
                <div key={creator.uuid} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative">
                    <Image
                      src={creator.avatar || '/placeholder-avatar.jpg'}
                      alt={creator.displayName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {creator.verified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{creator.displayName}</h4>
                        <div className="flex gap-1 mt-1">
                          <Badge className={`text-xs ${levelBadge.color}`}>
                            {levelBadge.text} Lv.{creator.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {creator.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {creator.bio}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">{creator.totalDesigns}</div>
                        <div className="text-muted-foreground">作品</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{creator.totalSales}</div>
                        <div className="text-muted-foreground">销量</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {creator.followers}
                      </div>

                      {creator.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {creator.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <Link
                      href={creator.storeSlug ? `/creator/${creator.storeSlug}` : `/creator/${creator.uuid}`}
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs h-7">
                        查看主页
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}