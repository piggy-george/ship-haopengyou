'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Image, AlertCircle } from 'lucide-react'

interface GenerationRecord {
  uuid: string
  type: string
  prompt: string
  output_urls: string[]
  credits_used: number
  status: string
  created_at: string
  error_message?: string
}

interface GenerationHistoryProps {
  type?: string
}

export function GenerationHistory({ type }: GenerationHistoryProps) {
  const [records, setRecords] = useState<GenerationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [type])

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams()
      if (type) params.append('type', type)

      const response = await fetch(`/api/ai/history?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRecords(data.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch generation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'processing':
        return <Badge variant="secondary">生成中</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text2img':
        return '文生图'
      case 'img2img':
        return '图生图'
      case 'text2model':
        return '3D建模'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            生成历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          生成历史
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无生成记录
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.uuid} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                    <span className="text-sm text-muted-foreground">
                      {getTypeLabel(record.type)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {record.credits_used} 积分
                  </span>
                </div>

                <p className="text-sm mb-3 line-clamp-2">
                  {record.prompt}
                </p>

                {record.status === 'completed' && record.output_urls && (
                  <div className="grid grid-cols-2 gap-2">
                    {record.output_urls.slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Generated ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}

                {record.status === 'failed' && record.error_message && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {record.error_message}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(record.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}