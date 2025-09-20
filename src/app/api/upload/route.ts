import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadToStorage } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片格式' }, { status: 400 })
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 })
    }

    // 上传文件
    const url = await uploadToStorage(file, folder, session.user.id)

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('File upload failed:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}