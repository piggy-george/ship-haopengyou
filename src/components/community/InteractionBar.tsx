'use client'

import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

interface InteractionBarProps {
  likes: number
  comments: number
  shares: number
  onLike: () => void
  onComment: () => void
  onShare: () => void
  liked?: boolean
}

export function InteractionBar({
  likes,
  comments,
  shares,
  onLike,
  onComment,
  onShare,
  liked = false
}: InteractionBarProps) {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="flex items-center justify-between border-t pt-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`h-8 px-2 ${liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
        >
          <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
          {formatCount(likes)}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="h-8 px-2 text-muted-foreground hover:text-blue-500"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {formatCount(comments)}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-8 px-2 text-muted-foreground hover:text-green-500"
        >
          <Share2 className="w-4 h-4 mr-1" />
          {formatCount(shares)}
        </Button>
      </div>
    </div>
  )
}