'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Package } from 'lucide-react'
import Image from 'next/image'

interface OrderItem {
  uuid: string
  orderNumber: string
  productName: string
  productImage: string
  quantity: number
  totalPrice: number
  status: string
  customization: any
  createdAt: string
  customer: {
    name: string
    email: string
  }
}

export function RecentOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/creator/orders?limit=10')
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending_payment': { label: '待付款', variant: 'secondary' as const },
      'paid': { label: '已付款', variant: 'default' as const },
      'designing': { label: '设计中', variant: 'default' as const },
      'producing': { label: '生产中', variant: 'default' as const },
      'shipped': { label: '已发货', variant: 'default' as const },
      'delivered': { label: '已送达', variant: 'default' as const },
      'completed': { label: '已完成', variant: 'default' as const },
      'cancelled': { label: '已取消', variant: 'destructive' as const }
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>最近订单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle>最近订单</CardTitle>
          <Button variant="outline" size="sm">
            查看全部
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.uuid} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={order.productImage || '/placeholder-product.jpg'}
                    alt={order.productName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium line-clamp-1">{order.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        订单号: {order.orderNumber}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      数量: {order.quantity} | 客户: {order.customer.name}
                    </div>
                    <div className="font-semibold">
                      ¥{order.totalPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      查看详情
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