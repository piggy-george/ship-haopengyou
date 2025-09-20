'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MaterialSelector } from './MaterialSelector'
import { SizeSelector } from './SizeSelector'
import { QuantitySelector } from './QuantitySelector'
import { PriceCalculator } from './PriceCalculator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'

interface Product {
  uuid: string
  name: string
  description: string | null
  images: any
  base_price: any
  available_materials: any
  available_sizes: any
  available_colors: any
  allow_engraving: boolean
  category: {
    name: string
    production_time: number
    max_order_quantity: number
  } | null
}

interface Material {
  uuid: string
  name: string
  description: string | null
  price_modifier: any
  properties: any
}

interface Customization {
  material: string
  size: string
  color: string
  quantity: number
  engraving: string
}

interface ProductCustomizerProps {
  product: Product
  availableMaterials: Material[]
}

export function ProductCustomizer({ product, availableMaterials }: ProductCustomizerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [customization, setCustomization] = useState<Customization>({
    material: availableMaterials[0]?.uuid || '',
    size: (product.available_sizes as string[])?.[0] || '',
    color: (product.available_colors as string[])?.[0] || '',
    quantity: 1,
    engraving: ''
  })
  const [addingToCart, setAddingToCart] = useState(false)

  const updateCustomization = (key: keyof Customization, value: string | number) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const calculatePrice = () => {
    const selectedMaterial = availableMaterials.find(m => m.uuid === customization.material)
    const materialMultiplier = parseFloat(selectedMaterial?.price_modifier?.toString() || '1')
    const basePrice = parseFloat(product.base_price?.toString() || '0') * materialMultiplier
    const engravingPrice = customization.engraving ? 10 : 0 // 刻字额外费用
    return (basePrice + engravingPrice) * customization.quantity
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUuid: product.uuid,
          customization,
          quantity: customization.quantity
        }),
      })

      if (response.ok) {
        // TODO: 显示成功提示
        console.log('Added to cart successfully')
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      // TODO: 显示错误提示
    } finally {
      setAddingToCart(false)
    }
  }

  const totalPrice = calculatePrice()

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* 产品图片展示 */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={(product.images as string[])?.[currentImageIndex] || '/placeholder-product.jpg'}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        {(product.images as string[])?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {(product.images as string[]).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                  currentImageIndex === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 定制选项 */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground">{product.description || '暂无描述'}</p>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">分类: </span>
            <span className="text-sm">{product.category?.name || '未分类'}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>定制选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 材质选择 */}
            <MaterialSelector
              materials={availableMaterials}
              value={customization.material}
              onChange={(value) => updateCustomization('material', value)}
            />

            {/* 尺寸选择 */}
            <SizeSelector
              sizes={(product.available_sizes as string[]) || []}
              value={customization.size}
              onChange={(value) => updateCustomization('size', value)}
            />

            {/* 颜色选择 */}
            <div>
              <Label className="text-base font-medium">颜色</Label>
              <div className="flex gap-2 mt-2">
                {((product.available_colors as string[]) || []).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCustomization('color', color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      customization.color === color ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* 数量选择 */}
            <QuantitySelector
              value={customization.quantity}
              onChange={(value) => updateCustomization('quantity', value)}
              max={product.category?.max_order_quantity || 100}
            />

            {/* 个性化刻字 */}
            {product.allow_engraving && (
              <div>
                <Label htmlFor="engraving" className="text-base font-medium">
                  个性化刻字 (可选)
                </Label>
                <Input
                  id="engraving"
                  type="text"
                  maxLength={20}
                  value={customization.engraving}
                  onChange={(e) => updateCustomization('engraving', e.target.value)}
                  placeholder="最多20个字符"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  刻字服务 +¥10
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 价格和购买 */}
        <Card>
          <CardContent className="p-6">
            <PriceCalculator
              basePrice={product.base_price}
              customization={customization}
              materials={availableMaterials}
            />

            <div className="flex gap-4 mt-6">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addingToCart ? '添加中...' : '加入购物车'}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>• 预计生产时间：{product.category?.production_time || 7}天</p>
              <p>• 支持7天无理由退换</p>
              <p>• 全国包邮</p>
              <p>• 提供生产进度跟踪</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}