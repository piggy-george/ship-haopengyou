'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  onSortChange?: (sort: string) => void
}

const sortOptions = [
  { value: 'relevance', label: '相关度' },
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'popular', label: '热门程度' },
  { value: 'rating', label: '评分最高' }
]

export function SearchBar({ onSearch, onSortChange }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('relevance')

  const handleSearch = () => {
    onSearch?.(query)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    onSortChange?.(value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索商品、设计师或标签..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">排序:</span>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}