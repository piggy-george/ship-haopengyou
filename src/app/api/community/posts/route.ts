import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { communityPosts, users, creators, products } from '@/db/schema'
import { eq, desc, and, like } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all'
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 对于公开API，只显示已发布的内容，除非是管理员接口
    let whereConditions = []

    // 状态筛选逻辑
    if (!filter || filter === 'all') {
      // 默认只显示已发布的
      whereConditions.push(eq(communityPosts.status, 'published'))
    } else if (['draft', 'pending', 'published', 'rejected', 'hidden', 'deleted'].includes(filter)) {
      // 指定状态筛选（通常用于管理后台）
      whereConditions.push(eq(communityPosts.status, filter))
    } else {
      // 内容类型筛选（ai, featured等），保持已发布状态
      whereConditions.push(eq(communityPosts.status, 'published'))

      switch (filter) {
        case 'ai':
          whereConditions.push(eq(communityPosts.is_ai_generated, true))
          break
        case 'featured':
          whereConditions.push(eq(communityPosts.featured, true))
          break
      }
    }

    // 标签筛选
    if (tag) {
      // 这里简化处理，实际应该用专门的标签表
      whereConditions.push(like(communityPosts.title, `%${tag}%`))
    }

    const postsData = await db.select({
      uuid: communityPosts.uuid,
      title: communityPosts.title,
      content: communityPosts.content,
      images: communityPosts.images,
      is_ai_generated: communityPosts.is_ai_generated,
      ai_prompt: communityPosts.ai_prompt,
      generation_cost: communityPosts.generation_cost,
      views: communityPosts.views,
      likes: communityPosts.likes,
      comments: communityPosts.comments,
      shares: communityPosts.shares,
      featured: communityPosts.featured,
      created_at: communityPosts.created_at,
      author: {
        uuid: creators.uuid,
        displayName: users.nickname,
        avatar: users.avatar_url,
        verified: creators.verified
      },
      product: {
        uuid: products.uuid,
        name: products.name,
        basePrice: products.base_price
      }
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.author_uuid, users.uuid))
    .leftJoin(creators, eq(users.uuid, creators.user_uuid))
    .leftJoin(products, eq(communityPosts.product_uuid, products.uuid))
    .where(and(...whereConditions))
    .orderBy(desc(communityPosts.created_at))
    .limit(Math.min(limit, 50))
    .offset(offset)

    // 转换数据格式
    const posts = postsData.map(post => ({
      uuid: post.uuid,
      title: post.title,
      content: post.content,
      images: post.images as string[] || [],
      author: {
        uuid: post.author?.uuid || '',
        displayName: post.author?.displayName || '匿名用户',
        avatar: post.author?.avatar || '',
        verified: post.author?.verified || false
      },
      product: post.product?.uuid ? {
        uuid: post.product.uuid,
        name: post.product.name,
        basePrice: parseFloat(post.product.basePrice?.toString() || '0')
      } : null,
      isAiGenerated: post.is_ai_generated,
      aiPrompt: post.ai_prompt,
      generationCost: post.generation_cost,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      featured: post.featured,
      createdAt: post.created_at?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Failed to fetch community posts:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const {
      title,
      content,
      images,
      videoUrl,
      productUuid,
      isAiGenerated,
      aiPrompt,
      generationCost,
      isDraft = false
    } = await req.json()

    // 验证必填字段
    if (!title || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: '标题和图片不能为空' }, { status: 400 })
    }

    // 限制图片数量
    if (images.length > 9) {
      return NextResponse.json({ error: '最多只能上传9张图片' }, { status: 400 })
    }

    // 验证标题长度
    if (title.length > 100) {
      return NextResponse.json({ error: '标题不能超过100个字符' }, { status: 400 })
    }

    // 验证内容长度
    if (content && content.length > 2000) {
      return NextResponse.json({ error: '内容不能超过2000个字符' }, { status: 400 })
    }

    // 创建帖子
    const postUuid = uuidv4()
    const status = isDraft ? 'draft' : 'pending' // 草稿或待审核

    const [newPost] = await db.insert(communityPosts).values({
      uuid: postUuid,
      author_uuid: session.user.id,
      title,
      content: content || null,
      images: images,
      video_url: videoUrl || null,
      product_uuid: productUuid || null,
      is_ai_generated: isAiGenerated || false,
      ai_prompt: aiPrompt || null,
      generation_cost: generationCost || null,
      status,
      published_at: status === 'pending' ? new Date() : null,
      created_at: new Date(),
      updated_at: new Date()
    }).returning()

    return NextResponse.json({
      success: true,
      post: {
        uuid: newPost.uuid,
        title: newPost.title,
        status: newPost.status,
        createdAt: newPost.created_at?.toISOString()
      },
      message: isDraft ? '作品已保存为草稿' : '作品已提交，等待审核'
    })

  } catch (error) {
    console.error('Failed to create community post:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}