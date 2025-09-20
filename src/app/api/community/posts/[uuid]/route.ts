import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { communityPosts } from '@/db/schema'
import { eq } from 'drizzle-orm'

// 获取单个帖子详情
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params

    const [post] = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.uuid, uuid))
      .limit(1)

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新帖子状态（仅管理员或作者）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { uuid } = await params
    const { status, rejectReason } = await req.json()

    // 验证状态值
    const validStatuses = ['draft', 'pending', 'published', 'rejected', 'hidden', 'deleted']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 })
    }

    // 获取原帖子
    const [existingPost] = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.uuid, uuid))
      .limit(1)

    if (!existingPost) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 权限检查：只有作者可以编辑草稿，管理员可以审核
    const isAuthor = existingPost.author_uuid === session.user.id
    const isAdmin = session.user.role === 'admin' // 假设有管理员角色

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }

    // 作者只能修改自己的草稿状态
    if (isAuthor && !isAdmin) {
      if (existingPost.status !== 'draft' && status !== 'pending') {
        return NextResponse.json({ error: '只能修改草稿状态或提交审核' }, { status: 403 })
      }
    }

    // 更新帖子状态
    const updateData: any = {
      status,
      updated_at: new Date()
    }

    // 如果是发布状态，设置发布时间
    if (status === 'published') {
      updateData.published_at = new Date()
    }

    // 如果是拒绝状态，可以保存拒绝原因（需要添加字段）
    if (status === 'rejected' && rejectReason) {
      // 这里可以扩展数据库结构来保存拒绝原因
      console.log('Reject reason:', rejectReason)
    }

    const [updatedPost] = await db.update(communityPosts)
      .set(updateData)
      .where(eq(communityPosts.uuid, uuid))
      .returning()

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: getStatusMessage(status)
    })

  } catch (error) {
    console.error('Failed to update post status:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 删除帖子（软删除）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { uuid } = await params

    // 获取原帖子
    const [existingPost] = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.uuid, uuid))
      .limit(1)

    if (!existingPost) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    // 权限检查：只有作者或管理员可以删除
    const isAuthor = existingPost.author_uuid === session.user.id
    const isAdmin = session.user.role === 'admin'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }

    // 软删除
    await db.update(communityPosts)
      .set({
        status: 'deleted',
        updated_at: new Date()
      })
      .where(eq(communityPosts.uuid, uuid))

    return NextResponse.json({
      success: true,
      message: '帖子已删除'
    })

  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'draft':
      return '已保存为草稿'
    case 'pending':
      return '已提交审核'
    case 'published':
      return '已发布'
    case 'rejected':
      return '审核不通过'
    case 'hidden':
      return '已隐藏'
    case 'deleted':
      return '已删除'
    default:
      return '状态已更新'
  }
}