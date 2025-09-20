'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface CartItem {
  id: string
  product: {
    uuid: string
    name: string
    image: string
    basePrice: number
    status: string
  }
  customization: {
    material: string
    size: string
    color: string
    quantity: number
    engraving: string
  }
  quantity: number
  itemPrice: number
  engravingPrice: number
  totalPrice: number
  material: string
  addedAt: string
}

interface CartData {
  items: CartItem[]
  totalAmount: number
  totalItems: number
}

export function Cart() {
  const [cartData, setCartData] = useState<CartData>({ items: [], totalAmount: 0, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()

      if (response.ok) {
        setCartData(data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setRemoving(itemId)

    try {
      const response = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCart() // 重新获取购物车数据
      }
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setRemoving(null)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      })

      if (response.ok) {
        setCartData({ items: [], totalAmount: 0, totalItems: 0 })
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cartData.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">购物车是空的</h3>
            <p className="text-muted-foreground mb-4">
              快去挑选您喜欢的商品吧！
            </p>
            <Link href="/marketplace">
              <Button>去逛逛</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>购物车 ({cartData.totalItems} 件商品)</CardTitle>
            <Button variant="outline" size="sm" onClick={clearCart}>
              清空购物车
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartData.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
              <div className="w-20 h-20 flex-shrink-0">
                <Image
                  src={item.product.image || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={removing === item.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">材质: {item.material}</Badge>
                  <Badge variant="outline">尺寸: {item.customization.size}</Badge>
                  <Badge variant="outline">颜色: {item.customization.color}</Badge>
                  {item.customization.engraving && (
                    <Badge variant="outline">刻字: {item.customization.engraving}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">数量:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">¥{item.totalPrice.toFixed(2)}</div>
                    {item.engravingPrice > 0 && (
                      <div className="text-xs text-muted-foreground">
                        (含刻字 ¥{item.engravingPrice})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 价格汇总 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>商品小计:</span>
              <span>¥{cartData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>运费:</span>
              <span>免费</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-semibold">
              <span>总计:</span>
              <span className="text-primary">¥{cartData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout" className="block mt-6">
            <Button size="lg" className="w-full">
              去结账
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}