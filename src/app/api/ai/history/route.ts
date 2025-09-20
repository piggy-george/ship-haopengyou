import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { aiGenerationRecords } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')

    const conditions = [eq(aiGenerationRecords.user_uuid, session.user.id)]

    if (type) {
      conditions.push(eq(aiGenerationRecords.type, type))
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0]

    const records = await db.select()
      .from(aiGenerationRecords)
      .where(whereCondition)
      .orderBy(desc(aiGenerationRecords.created_at))
      .limit(Math.min(limit, 50))

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Failed to fetch AI generation history:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}