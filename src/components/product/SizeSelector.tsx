'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface SizeSelectorProps {
  sizes: string[]
  value: string
  onChange: (value: string) => void
}

const getSizeDisplay = (size: string) => {
  // 将尺寸代码转换为显示文本
  const sizeMap: Record<string, string> = {
    'xs': 'XS',
    's': 'S',
    'm': 'M',
    'l': 'L',
    'xl': 'XL',
    'xxl': 'XXL',
    'small': '小号',
    'medium': '中号',
    'large': '大号',
    'one-size': '均码'
  }

  return sizeMap[size.toLowerCase()] || size.toUpperCase()
}

const getSizeDescription = (size: string) => {
  // 提供尺寸的详细说明
  const descriptions: Record<string, string> = {
    'xs': '超小号 - 适合纤细体型',
    's': '小号 - 适合偏瘦体型',
    'm': '中号 - 标准尺寸',
    'l': '大号 - 适合偏胖体型',
    'xl': '加大号 - 宽松舒适',
    'xxl': '超大号 - 非常宽松',
    'small': '小尺寸 - 精致小巧',
    'medium': '中等尺寸 - 标准大小',
    'large': '大尺寸 - 醒目大气',
    'one-size': '均码 - 适合大多数人'
  }

  return descriptions[size.toLowerCase()] || ''
}

export function SizeSelector({ sizes, value, onChange }: SizeSelectorProps) {
  if (sizes.length === 0) {
    return null
  }

  return (
    <div>
      <Label className="text-base font-medium">尺寸</Label>
      <div className="mt-3">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={value === size ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(size)}
              className="min-w-[60px]"
            >
              {getSizeDisplay(size)}
            </Button>
          ))}
        </div>

        {value && getSizeDescription(value) && (
          <p className="text-sm text-muted-foreground mt-2">
            {getSizeDescription(value)}
          </p>
        )}

        {/* 尺寸指南链接 */}
        <button className="text-sm text-primary hover:underline mt-2">
          查看尺寸指南 →
        </button>
      </div>
    </div>
  )
}