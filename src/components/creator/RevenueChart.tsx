'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/creator/revenue?range=${timeRange}`)
      const result = await response.json()

      if (response.ok) {
        setData(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => `¥${value.toFixed(0)}`

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>收益趋势</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
              <SelectItem value="1y">最近一年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">暂无数据</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), '收益']}
                  labelFormatter={(label) => `日期: ${formatDate(label)}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">总收益</p>
              <p className="text-lg font-semibold">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均日收益</p>
              <p className="text-lg font-semibold">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">总订单数</p>
              <p className="text-lg font-semibold">
                {data.reduce((sum, item) => sum + item.orders, 0)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}