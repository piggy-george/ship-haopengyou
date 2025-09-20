import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { creators, products, orders, orderItems, earnings } from '@/db/schema'
import { eq, and, gte, sum, count, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 检查用户是否为创作者
    const creator = await db.select({
      uuid: creators.uuid,
      level: creators.level,
      verified: creators.verified,
      total_designs: creators.total_designs,
      total_sales: creators.total_sales,
      total_revenue: creators.total_revenue,
      rating: creators.rating
    })
    .from(creators)
    .where(eq(creators.user_uuid, session.user.id))
    .limit(1)

    if (!creator[0]) {
      return NextResponse.json({ error: '您还不是创作者' }, { status: 403 })
    }

    const creatorData = creator[0]

    // 计算本月增长数据
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    // 本月新增作品数
    const monthlyDesigns = await db.select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.designer_uuid, creatorData.uuid),
          gte(products.created_at, currentMonth)
        )
      )

    // 本月销量和收益
    const monthlyEarnings = await db.select({
      sales: count(orderItems.id),
      revenue: sum(earnings.amount)
    })
    .from(earnings)
    .leftJoin(orderItems, eq(earnings.order_uuid, orderItems.order_uuid))
    .where(
      and(
        eq(earnings.creator_uuid, creatorData.uuid),
        gte(earnings.created_at, currentMonth)
      )
    )

    // 模拟粉丝数和浏览量（实际项目中需要从相应表获取）
    const followers = 1250 + Math.floor(Math.random() * 500) // 模拟数据
    const views = 15680 + Math.floor(Math.random() * 5000) // 模拟数据

    const stats = {
      totalDesigns: creatorData.total_designs,
      totalSales: creatorData.total_sales,
      totalRevenue: parseFloat(creatorData.total_revenue.toString()),
      rating: creatorData.rating ? parseFloat(creatorData.rating.toString()) : null,
      followers,
      views,
      monthlyGrowth: {
        designs: monthlyDesigns[0]?.count || 0,
        sales: monthlyEarnings[0]?.sales || 0,
        revenue: monthlyEarnings[0]?.revenue ? parseFloat(monthlyEarnings[0].revenue.toString()) : 0
      }
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Failed to fetch creator stats:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}