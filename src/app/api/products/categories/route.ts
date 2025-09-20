import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { productCategories, products } from '@/db/schema'
import { eq, count, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    // 获取所有有效的产品分类
    const categoriesData = await db.select({
      uuid: productCategories.uuid,
      name: productCategories.name,
      slug: productCategories.slug,
      description: productCategories.description,
      base_price: productCategories.base_price,
      production_time: productCategories.production_time,
      sort: productCategories.sort
    })
    .from(productCategories)
    .where(eq(productCategories.status, 'active'))
    .orderBy(productCategories.sort, productCategories.name)

    // 为每个分类统计商品数量
    const categoriesWithCount = await Promise.all(
      categoriesData.map(async (category) => {
        const productCount = await db.select({ count: count() })
          .from(products)
          .where(
            eq(products.category_uuid, category.uuid) &&
            eq(products.status, 'active')
          )

        return {
          ...category,
          productCount: productCount[0]?.count || 0
        }
      })
    )

    return NextResponse.json({ categories: categoriesWithCount })
  } catch (error) {
    console.error('Failed to fetch product categories:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}