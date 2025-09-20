'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Eye, Heart } from 'lucide-react'
import Image from 'next/image'

interface TopProduct {
  uuid: string
  name: string
  image: string
  basePrice: number
  sold: number
  revenue: number
  views: number
  likes: number
  isAiGenerated: boolean
  featured: boolean
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'sales' | 'revenue' | 'views'>('sales')

  useEffect(() => {
    fetchTopProducts()
  }, [sortBy])

  const fetchTopProducts = async () => {
    try {
      const response = await fetch(`/api/creator/products/top?sortBy=${sortBy}&limit=5`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch top products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>热门作品</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
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

  const sortOptions = [
    { value: 'sales', label: '销量' },
    { value: 'revenue', label: '收益' },
    { value: 'views', label: '浏览量' }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>热门作品</CardTitle>
          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无作品数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.uuid} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium line-clamp-1">{product.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {product.isAiGenerated && (
                          <Badge variant="secondary" className="text-xs">AI创作</Badge>
                        )}
                        {product.featured && (
                          <Badge variant="default" className="text-xs">精选</Badge>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">¥{product.basePrice}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{product.sold}</div>
                      <div className="text-muted-foreground">销量</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">¥{product.revenue.toFixed(0)}</div>
                      <div className="text-muted-foreground">收益</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{product.views}</div>
                      <div className="text-muted-foreground">浏览</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {product.likes}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      查看
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}