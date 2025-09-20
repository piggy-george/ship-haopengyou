'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({ value, onChange, min = 1, max = 999 }: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const getBulkDiscount = (quantity: number) => {
    if (quantity >= 10) return 10 // 10%折扣
    if (quantity >= 5) return 5   // 5%折扣
    return 0
  }

  const discount = getBulkDiscount(value)

  return (
    <div>
      <Label className="text-base font-medium">数量</Label>
      <div className="mt-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={value <= min}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-20 text-center"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={value >= max}
            className="h-10 w-10 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground">
            件 (最多 {max} 件)
          </div>
        </div>

        {/* 批量优惠提示 */}
        {discount > 0 && (
          <div className="mt-2 text-sm text-green-600">
            🎉 购买 {value} 件享受 {discount}% 折扣!
          </div>
        )}

        {/* 批量优惠规则 */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>批量优惠:</p>
          <p>• 购买 5-9 件: 5% 折扣</p>
          <p>• 购买 10 件以上: 10% 折扣</p>
        </div>
      </div>
    </div>
  )
}