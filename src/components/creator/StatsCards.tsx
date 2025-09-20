'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Package, DollarSign, Star, Users, Eye } from 'lucide-react'

interface CreatorStats {
  totalDesigns: number
  totalSales: number
  totalRevenue: number
  rating: number
  followers: number
  views: number
  monthlyGrowth: {
    designs: number
    sales: number
    revenue: number
  }
}

export function StatsCards() {
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/creator/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch creator stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">暂无数据</p>
      </div>
    )
  }

  const statCards = [
    {
      title: '总作品数',
      value: stats.totalDesigns,
      icon: Package,
      change: stats.monthlyGrowth.designs,
      changeLabel: '本月新增'
    },
    {
      title: '总销量',
      value: stats.totalSales,
      icon: TrendingUp,
      change: stats.monthlyGrowth.sales,
      changeLabel: '本月销量'
    },
    {
      title: '总收益',
      value: `¥${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: stats.monthlyGrowth.revenue,
      changeLabel: '本月收益'
    },
    {
      title: '评分',
      value: stats.rating ? stats.rating.toFixed(1) : 'N/A',
      icon: Star,
      suffix: stats.rating ? '/5.0' : ''
    },
    {
      title: '粉丝数',
      value: stats.followers,
      icon: Users
    },
    {
      title: '总浏览量',
      value: stats.views,
      icon: Eye
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value}
              {card.suffix && (
                <span className="text-sm text-muted-foreground ml-1">
                  {card.suffix}
                </span>
              )}
            </div>
            {card.change !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={card.change >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {card.change >= 0 ? '+' : ''}{card.change}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {card.changeLabel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}