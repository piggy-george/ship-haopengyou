import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { users, products, materials } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 获取用户购物车
    const user = await db.select({
      cart: users.cart
    })
    .from(users)
    .where(eq(users.uuid, session.user.id))
    .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const cart = (user[0].cart as any[]) || []

    if (cart.length === 0) {
      return NextResponse.json({ items: [], totalAmount: 0, totalItems: 0 })
    }

    // 获取购物车中所有商品的信息
    const productUuids = [...new Set(cart.map(item => item.productUuid))]
    const productsData = await db.select({
      uuid: products.uuid,
      name: products.name,
      images: products.images,
      base_price: products.base_price,
      status: products.status
    })
    .from(products)
    .where(inArray(products.uuid, productUuids))

    // 获取所有材质信息用于价格计算
    const materialsData = await db.select()
      .from(materials)

    // 计算购物车项目详情
    const cartItems = cart.map(item => {
      const product = productsData.find(p => p.uuid === item.productUuid)
      if (!product) return null

      const material = materialsData.find(m => m.uuid === item.customization.material)
      const materialMultiplier = parseFloat(material?.price_modifier?.toString() || '1')
      const basePrice = parseFloat(product.base_price?.toString() || '0')
      const itemPrice = basePrice * materialMultiplier
      const engravingPrice = item.customization.engraving ? 10 : 0
      const totalPrice = (itemPrice + engravingPrice) * item.quantity

      return {
        id: `${item.productUuid}_${JSON.stringify(item.customization)}`,
        product: {
          uuid: product.uuid,
          name: product.name,
          image: (product.images as string[])?.[0] || '',
          basePrice: parseFloat(product.base_price?.toString() || '0'),
          status: product.status
        },
        customization: item.customization,
        quantity: item.quantity,
        itemPrice,
        engravingPrice,
        totalPrice,
        material: material?.name || '默认材质',
        addedAt: item.addedAt
      }
    }).filter(Boolean)

    const totalAmount = cartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0)
    const totalItems = cartItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)

    return NextResponse.json({
      items: cartItems,
      totalAmount,
      totalItems
    })

  } catch (error) {
    console.error('Failed to get cart:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      // 清空购物车
      await db.update(users)
        .set({ cart: [] })
        .where(eq(users.uuid, session.user.id))

      return NextResponse.json({ success: true, message: '购物车已清空' })
    }

    // 删除特定商品
    const user = await db.select({ cart: users.cart })
      .from(users)
      .where(eq(users.uuid, session.user.id))
      .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const cart = (user[0].cart as any[]) || []
    const [productUuid, customizationStr] = itemId.split('_', 2)
    const customization = JSON.parse(customizationStr)

    const updatedCart = cart.filter(item =>
      !(item.productUuid === productUuid &&
        JSON.stringify(item.customization) === JSON.stringify(customization))
    )

    await db.update(users)
      .set({ cart: updatedCart })
      .where(eq(users.uuid, session.user.id))

    return NextResponse.json({ success: true, message: '商品已移除' })

  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}