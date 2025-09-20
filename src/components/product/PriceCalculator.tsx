'use client'

import { Separator } from '@/components/ui/separator'

interface Material {
  uuid: string
  name: string
  price_modifier: number
}

interface Customization {
  material: string
  size: string
  color: string
  quantity: number
  engraving: string
}

interface PriceCalculatorProps {
  basePrice: number
  customization: Customization
  materials: Material[]
}

export function PriceCalculator({ basePrice, customization, materials }: PriceCalculatorProps) {
  const selectedMaterial = materials.find(m => m.uuid === customization.material)
  const materialMultiplier = selectedMaterial?.price_modifier || 1

  // 计算各项费用
  const itemPrice = basePrice * materialMultiplier
  const engravingPrice = customization.engraving ? 10 : 0
  const subtotal = (itemPrice + engravingPrice) * customization.quantity

  // 批量折扣
  const getBulkDiscount = (quantity: number) => {
    if (quantity >= 10) return 0.1 // 10%
    if (quantity >= 5) return 0.05  // 5%
    return 0
  }

  const bulkDiscountRate = getBulkDiscount(customization.quantity)
  const bulkDiscount = subtotal * bulkDiscountRate

  const finalPrice = subtotal - bulkDiscount

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">价格明细</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>单价 ({selectedMaterial?.name || '默认材质'})</span>
          <span>¥{itemPrice.toFixed(2)}</span>
        </div>

        {customization.engraving && (
          <div className="flex justify-between">
            <span>个性化刻字</span>
            <span>¥{engravingPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>数量</span>
          <span>× {customization.quantity}</span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span>小计</span>
          <span>¥{subtotal.toFixed(2)}</span>
        </div>

        {bulkDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>批量折扣 (-{(bulkDiscountRate * 100).toFixed(0)}%)</span>
            <span>-¥{bulkDiscount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>总计</span>
          <span className="text-primary">¥{finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* 价格说明 */}
      <div className="text-xs text-muted-foreground space-y-1 mt-4">
        <p>• 价格包含制作费和基础包装</p>
        <p>• 全国包邮，无额外运费</p>
        <p>• 支持多种支付方式</p>
        {bulkDiscountRate > 0 && (
          <p className="text-green-600">• 已享受批量购买优惠</p>
        )}
      </div>
    </div>
  )
}