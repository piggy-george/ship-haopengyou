import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { reactions, communityPosts } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { postUuid, type } = await req.json()

    if (!postUuid || !type) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (!['like', 'favorite', 'share'].includes(type)) {
      return NextResponse.json({ error: '无效的互动类型' }, { status: 400 })
    }

    // 检查是否已经有过这种互动
    const existingReaction = await db.select()
      .from(reactions)
      .where(
        and(
          eq(reactions.user_uuid, session.user.id),
          eq(reactions.post_uuid, postUuid),
          eq(reactions.type, type)
        )
      )
      .limit(1)

    if (existingReaction.length > 0) {
      // 已经互动过，删除互动（取消点赞/收藏）
      await db.delete(reactions)
        .where(
          and(
            eq(reactions.user_uuid, session.user.id),
            eq(reactions.post_uuid, postUuid),
            eq(reactions.type, type)
          )
        )

      // 更新帖子统计
      if (type === 'like') {
        await db.update(communityPosts)
          .set({
            likes: sql`${communityPosts.likes} - 1`
          })
          .where(eq(communityPosts.uuid, postUuid))
      } else if (type === 'share') {
        await db.update(communityPosts)
          .set({
            shares: sql`${communityPosts.shares} - 1`
          })
          .where(eq(communityPosts.uuid, postUuid))
      }

      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      // 添加新的互动
      await db.insert(reactions).values({
        user_uuid: session.user.id,
        post_uuid: postUuid,
        type,
        created_at: new Date()
      })

      // 更新帖子统计
      if (type === 'like') {
        await db.update(communityPosts)
          .set({
            likes: sql`${communityPosts.likes} + 1`
          })
          .where(eq(communityPosts.uuid, postUuid))
      } else if (type === 'share') {
        await db.update(communityPosts)
          .set({
            shares: sql`${communityPosts.shares} + 1`
          })
          .where(eq(communityPosts.uuid, postUuid))
      }

      return NextResponse.json({ success: true, action: 'added' })
    }

  } catch (error) {
    console.error('Failed to handle interaction:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}