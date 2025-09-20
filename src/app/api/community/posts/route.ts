import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { communityPosts, users, creators, products } from '@/db/schema'
import { eq, desc, and, like } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all'
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereConditions = [eq(communityPosts.status, 'published')]

    // 筛选条件
    switch (filter) {
      case 'ai':
        whereConditions.push(eq(communityPosts.is_ai_generated, true))
        break
      case 'featured':
        whereConditions.push(eq(communityPosts.featured, true))
        break
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