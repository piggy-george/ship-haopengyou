'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Material {
  uuid: string
  name: string
  description: string | null
  price_modifier: any
  properties: any
}

interface MaterialSelectorProps {
  materials: Material[]
  value: string
  onChange: (value: string) => void
}

export function MaterialSelector({ materials, value, onChange }: MaterialSelectorProps) {
  const getTextureIcon = (texture: string) => {
    switch (texture) {
      case 'glossy':
        return '✨'
      case 'matte':
        return '🌙'
      case 'metallic':
        return '⚡'
      default:
        return '🎨'
    }
  }

  const getPriceModifierText = (modifier: any) => {
    const mod = parseFloat(modifier?.toString() || '1')
    if (mod === 1) return ''
    if (mod > 1) return `+${((mod - 1) * 100).toFixed(0)}%`
    return `-${((1 - mod) * 100).toFixed(0)}%`
  }

  return (
    <div>
      <Label className="text-base font-medium">材质选择</Label>
      <RadioGroup value={value} onValueChange={onChange} className="mt-3">
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.uuid} className="flex items-center space-x-3">
              <RadioGroupItem value={material.uuid} id={material.uuid} />
              <Card className="flex-1 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onChange(material.uuid)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{material.name}</span>
                        {material.properties?.texture && (
                          <span className="text-lg" title={material.properties.texture}>
                            {getTextureIcon(material.properties.texture)}
                          </span>
                        )}
                        {parseFloat(material.price_modifier?.toString() || '1') !== 1 && (
                          <Badge variant="secondary">
                            {getPriceModifierText(material.price_modifier)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {material.description || '暂无描述'}
                      </p>

                      {material.properties && (
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          {material.properties.durability && (
                            <span>耐用性: {material.properties.durability}/100</span>
                          )}
                          {material.properties.weight && (
                            <span>重量: {material.properties.weight}g</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}