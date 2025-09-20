import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { users, products, materials, orders, orderItems } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

interface OrderCreateRequest {
  items: Array<{
    productUuid: string
    customization: any
    quantity: number
  }>
  shippingAddress: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    address: string
    zipCode: string
  }
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { items, shippingAddress, notes }: OrderCreateRequest = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '订单商品不能为空' }, { status: 400 })
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
      return NextResponse.json({ error: '收货地址信息不完整' }, { status: 400 })
    }

    // 验证所有商品
    const productUuids = [...new Set(items.map(item => item.productUuid))]
    const productsData = await db.select({
      uuid: products.uuid,
      name: products.name,
      base_price: products.base_price,
      status: products.status,
      customizable: products.customizable
    })
    .from(products)
    .where(inArray(products.uuid, productUuids))

    // 获取材质信息
    const materialsData = await db.select()
      .from(materials)

    // 验证商品状态和计算价格
    let subtotal = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const product = productsData.find(p => p.uuid === item.productUuid)
      if (!product) {
        return NextResponse.json({
          error: `商品不存在: ${item.productUuid}`
        }, { status: 400 })
      }

      if (product.status !== 'active') {
        return NextResponse.json({
          error: `商品已下架: ${product.name}`
        }, { status: 400 })
      }

      if (!product.customizable) {
        return NextResponse.json({
          error: `商品不支持定制: ${product.name}`
        }, { status: 400 })
      }

      // 计算商品价格
      const material = materialsData.find(m => m.uuid === item.customization.material)
      const materialMultiplier = parseFloat(material?.price_modifier?.toString() || '1')
      const basePrice = parseFloat(product.base_price?.toString() || '0')
      const itemPrice = basePrice * materialMultiplier
      const engravingPrice = item.customization.engraving ? 10 : 0
      const totalPrice = (itemPrice + engravingPrice) * item.quantity

      subtotal += totalPrice

      validatedItems.push({
        ...item,
        product,
        itemPrice,
        engravingPrice,
        totalPrice
      })
    }

    // 计算运费和税费
    const shipping = 0 // 免费包邮
    const tax = 0 // 价格含税
    const total = subtotal + shipping + tax

    // 生成订单号
    const orderNumber = generateOrderNumber()
    const orderUuid = generateUuid()

    await db.transaction(async (tx) => {
      // 创建订单
      await tx.insert(orders).values({
        uuid: orderUuid,
        order_no: orderNumber,
        user_uuid: session.user.id,
        user_email: session.user.email || '',
        amount: Math.round(total * 100), // 转换为分
        status: 'pending_payment',
        credits: 0, // 暂时不支持积分支付
        currency: 'CNY',
        order_detail: JSON.stringify({
          shippingAddress,
          notes,
          subtotal,
          shipping,
          tax,
          total
        }),
        created_at: new Date()
      })

      // 创建订单项目
      for (const item of validatedItems) {
        await tx.insert(orderItems).values({
          uuid: 'oi_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          order_uuid: orderUuid,
          product_uuid: item.productUuid,
          quantity: item.quantity,
          unit_price: item.itemPrice + item.engravingPrice,
          total_price: item.totalPrice,
          customization: item.customization,
          created_at: new Date()
        })
      }

      // 清空购物车
      await tx.update(users)
        .set({ cart: [] })
        .where(eq(users.uuid, session.user.id))
    })

    return NextResponse.json({
      success: true,
      order: {
        uuid: orderUuid,
        orderNumber,
        total,
        status: 'pending_payment'
      }
    })

  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }
}

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()

  return `ORD${year}${month}${day}${random}`
}

function generateUuid(): string {
  return 'ord_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}