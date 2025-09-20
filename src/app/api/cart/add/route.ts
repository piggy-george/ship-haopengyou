import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { products, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// 购物车项目接口
interface CartItem {
  productUuid: string
  customization: {
    material: string
    size: string
    color: string
    quantity: number
    engraving: string
  }
  quantity: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { productUuid, customization, quantity }: CartItem = await req.json()

    // 验证产品是否存在且可定制
    const product = await db.select({
      uuid: products.uuid,
      name: products.name,
      customizable: products.customizable,
      status: products.status
    })
    .from(products)
    .where(eq(products.uuid, productUuid))
    .limit(1)

    if (!product[0]) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 })
    }

    if (product[0].status !== 'active') {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 })
    }

    if (!product[0].customizable) {
      return NextResponse.json({ error: '该商品不支持定制' }, { status: 400 })
    }

    // 获取用户当前购物车（存储在用户表的JSON字段中）
    const user = await db.select({
      uuid: users.uuid,
      cart: users.cart
    })
    .from(users)
    .where(eq(users.uuid, session.user.id))
    .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 解析现有购物车数据
    const currentCart = (user[0].cart as any[]) || []

    // 检查是否已有相同的定制商品
    const existingItemIndex = currentCart.findIndex(item =>
      item.productUuid === productUuid &&
      JSON.stringify(item.customization) === JSON.stringify(customization)
    )

    if (existingItemIndex >= 0) {
      // 更新数量
      currentCart[existingItemIndex].quantity += quantity
    } else {
      // 添加新项目
      currentCart.push({
        productUuid,
        customization,
        quantity,
        addedAt: new Date().toISOString()
      })
    }

    // 更新用户购物车
    await db.update(users)
      .set({ cart: currentCart })
      .where(eq(users.uuid, session.user.id))

    return NextResponse.json({
      success: true,
      message: '已加入购物车',
      cartItemsCount: currentCart.length
    })

  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}