import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { products, productCategories, creators, users } from '@/db/schema'
import { eq, desc, and, like, gte, lte } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereConditions = []

    // 状态筛选
    whereConditions.push(eq(products.status, 'active'))

    // 分类筛选
    if (category) {
      const categoryData = await db.select({ uuid: productCategories.uuid })
        .from(productCategories)
        .where(eq(productCategories.slug, category))
        .limit(1)

      if (categoryData[0]) {
        whereConditions.push(eq(products.category_uuid, categoryData[0].uuid))
      }
    }

    // 搜索筛选
    if (search) {
      whereConditions.push(like(products.name, `%${search}%`))
    }

    // 价格筛选
    if (minPrice) {
      whereConditions.push(gte(products.base_price, minPrice))
    }
    if (maxPrice) {
      whereConditions.push(lte(products.base_price, maxPrice))
    }

    // 精选筛选
    if (featured) {
      whereConditions.push(eq(products.featured, true))
    }

    // 排序
    let orderBy
    switch (sort) {
      case 'price_asc':
        orderBy = products.base_price
        break
      case 'price_desc':
        orderBy = desc(products.base_price)
        break
      case 'popular':
        orderBy = desc(products.sold)
        break
      case 'newest':
      default:
        orderBy = desc(products.created_at)
        break
    }

    const productsData = await db.select({
      uuid: products.uuid,
      name: products.name,
      slug: products.slug,
      description: products.description,
      images: products.images,
      base_price: products.base_price,
      category_uuid: products.category_uuid,
      is_ai_generated: products.is_ai_generated,
      tags: products.tags,
      featured: products.featured,
      sold: products.sold,
      designer: {
        display_name: users.nickname,
        verified: creators.verified
      }
    })
    .from(products)
    .leftJoin(creators, eq(products.designer_uuid, creators.uuid))
    .leftJoin(users, eq(creators.user_uuid, users.uuid))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(Math.min(limit, 50))
    .offset(offset)

    return NextResponse.json({ products: productsData })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}