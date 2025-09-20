import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { deductCredits, getUserCredits, refundCredits } from '@/lib/credits'
import { generateWithStableDiffusion } from '@/lib/ai/stable-diffusion'
import { aiGenerationRecords } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { prompt, negativePrompt, style, quality, aspectRatio, count } = await req.json()

    // 参数验证
    if (!prompt) {
      return NextResponse.json({ error: '请输入生成提示词' }, { status: 400 })
    }

    // 计算积分消耗
    const creditCost = calculateCreditCost(quality, count)

    // 检查积分余额
    const userCredits = await getUserCredits(session.user.id)
    if (userCredits < creditCost) {
      return NextResponse.json({
        error: '积分不足',
        required: creditCost,
        current: userCredits
      }, { status: 400 })
    }

    // 创建生成记录
    const recordUuid = generateUuid()
    await db.insert(aiGenerationRecords).values({
      uuid: recordUuid,
      user_uuid: session.user.id,
      type: 'text2img',
      prompt,
      negative_prompt: negativePrompt,
      params: { style, quality, aspectRatio, count },
      credits_used: creditCost,
      status: 'processing'
    })

    try {
      // 扣除积分
      await deductCredits(session.user.id, creditCost, 'ai_generation', '文生图生成')

      // 调用AI服务生成图片
      const images = await generateWithStableDiffusion({
        prompt: `${style} style, ${prompt}`,
        negative_prompt: negativePrompt,
        width: getWidth(aspectRatio),
        height: getHeight(aspectRatio),
        num_outputs: count,
        guidance_scale: 7.5,
        num_inference_steps: quality === 'high' ? 50 : 30
      })

      // 更新生成记录
      await db.update(aiGenerationRecords)
        .set({
          output_urls: images,
          status: 'completed',
          completed_at: new Date()
        })
        .where(eq(aiGenerationRecords.uuid, recordUuid))

      return NextResponse.json({
        images,
        recordId: recordUuid,
        creditsUsed: creditCost,
        remainingCredits: userCredits - creditCost
      })
    } catch (error) {
      // 生成失败，退还积分并更新记录
      await refundCredits(session.user.id, creditCost, 'ai_generation_refund', '文生图生成失败退款')

      await db.update(aiGenerationRecords)
        .set({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error)
        })
        .where(eq(aiGenerationRecords.uuid, recordUuid))

      return NextResponse.json({
        error: '生成失败，积分已退还，请重试'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Text to image generation error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

function calculateCreditCost(quality: string, count: number): number {
  const baseCost = quality === 'high' ? 20 : quality === 'standard' ? 10 : 5
  return baseCost * count
}

function getWidth(aspectRatio: string): number {
  switch (aspectRatio) {
    case '1:1': return 512
    case '16:9': return 768
    case '9:16': return 432
    default: return 512
  }
}

function getHeight(aspectRatio: string): number {
  switch (aspectRatio) {
    case '1:1': return 512
    case '16:9': return 432
    case '9:16': return 768
    default: return 512
  }
}

function generateUuid(): string {
  return 'gen_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}