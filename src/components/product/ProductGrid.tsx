'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

interface Product {
  uuid: string
  name: string
  slug: string
  description: string
  images: string[]
  base_price: number
  category_uuid: string
  is_ai_generated: boolean
  tags: string[]
  featured: boolean
  designer?: {
    display_name: string
    verified: boolean
  }
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (productUuid: string) => {
    try {
      const response = await fetch('/api/products/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUuid }),
      })

      if (response.ok) {
        setFavorites(prev => {
          const newFavorites = new Set(prev)
          if (newFavorites.has(productUuid)) {
            newFavorites.delete(productUuid)
          } else {
            newFavorites.add(productUuid)
          }
          return newFavorites
        })
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.uuid} className="group hover:shadow-lg transition-shadow">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500">
                精选
              </Badge>
            )}

            {product.is_ai_generated && (
              <Badge className="absolute top-2 right-2 bg-purple-500">
                AI创作
              </Badge>
            )}

            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => toggleFavorite(product.uuid)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.has(product.uuid)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                  {product.name}
                </h3>
              </div>

              {product.designer && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{product.designer.display_name}</span>
                  {product.designer.verified && (
                    <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  ¥{product.base_price}
                </span>
                <span className="text-xs text-muted-foreground">
                  起
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/marketplace/product/${product.slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    查看详情
                  </Button>
                </Link>
                <Link href={`/customize/${product.uuid}`}>
                  <Button size="sm" className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    定制
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">暂无商品</p>
        </div>
      )}
    </div>
  )
}