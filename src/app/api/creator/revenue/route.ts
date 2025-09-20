import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { creators, earnings } from '@/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'

    // 检查用户是否为创作者
    const creator = await db.select({
      uuid: creators.uuid
    })
    .from(creators)
    .where(eq(creators.user_uuid, session.user.id))
    .limit(1)

    if (!creator[0]) {
      return NextResponse.json({ error: '您还不是创作者' }, { status: 403 })
    }

    // 计算时间范围
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // 查询收益数据，按日期分组
    const revenueData = await db.select({
      date: sql<string>`DATE(${earnings.created_at})`,
      revenue: sql<number>`SUM(${earnings.amount})`,
      orders: sql<number>`COUNT(DISTINCT ${earnings.order_uuid})`
    })
    .from(earnings)
    .where(
      and(
        eq(earnings.creator_uuid, creator[0].uuid),
        gte(earnings.created_at, startDate),
        eq(earnings.status, 'settled') // 只统计已结算的收益
      )
    )
    .groupBy(sql`DATE(${earnings.created_at})`)
    .orderBy(sql`DATE(${earnings.created_at})`)

    // 填充缺失日期的数据
    const result = []
    const currentDate = new Date(startDate)

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const existingData = revenueData.find(item => item.date === dateStr)

      result.push({
        date: dateStr,
        revenue: existingData?.revenue || 0,
        orders: existingData?.orders || 0
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ data: result })

  } catch (error) {
    console.error('Failed to fetch revenue data:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}