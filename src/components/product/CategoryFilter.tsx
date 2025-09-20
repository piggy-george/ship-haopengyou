'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ProductCategory {
  uuid: string
  name: string
  slug: string
  description: string
  productCount?: number
}

interface CategoryFilterProps {
  onCategoryChange?: (categorySlug: string | null) => void
  onPriceRangeChange?: (min: number | null, max: number | null) => void
}

const priceRanges = [
  { label: '全部价格', min: null, max: null },
  { label: '¥50以下', min: null, max: 50 },
  { label: '¥50-¥100', min: 50, max: 100 },
  { label: '¥100-¥200', min: 100, max: 200 },
  { label: '¥200-¥500', min: 200, max: 500 },
  { label: '¥500以上', min: 500, max: null },
]

export function CategoryFilter({ onCategoryChange, onPriceRangeChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<typeof priceRanges[0]>(priceRanges[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }

  const handlePriceRangeSelect = (range: typeof priceRanges[0]) => {
    setSelectedPriceRange(range)
    onPriceRangeChange?.(range.min, range.max)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 商品分类 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">商品分类</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => handleCategorySelect(null)}
          >
            全部分类
          </Button>

          <Separator />

          {categories.map((category) => (
            <Button
              key={category.uuid}
              variant={selectedCategory === category.slug ? 'default' : 'ghost'}
              className="w-full justify-between"
              onClick={() => handleCategorySelect(category.slug)}
            >
              <span>{category.name}</span>
              {category.productCount && (
                <Badge variant="secondary" className="ml-auto">
                  {category.productCount}
                </Badge>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* 价格区间 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">价格区间</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {priceRanges.map((range, index) => (
            <Button
              key={index}
              variant={selectedPriceRange === range ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handlePriceRangeSelect(range)}
            >
              {range.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* 特色标签 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">特色</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            AI创作
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            精选推荐
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            新品上架
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            热门商品
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}