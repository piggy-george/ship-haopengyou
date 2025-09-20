import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import { redirect, notFound } from 'next/navigation'
import { ProductCustomizer } from '@/components/product/ProductCustomizer'
import { db } from '@/db'
import { products, productCategories, materials } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface CustomizePageProps {
  params: Promise<{ id: string }>
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { id } = await params
  const session = await auth()
  const t = await getTranslations('customize')

  if (!session) {
    redirect('/auth/signin')
  }

  // 获取产品信息
  const product = await db.select({
    uuid: products.uuid,
    name: products.name,
    description: products.description,
    images: products.images,
    base_price: products.base_price,
    customizable: products.customizable,
    available_materials: products.available_materials,
    available_sizes: products.available_sizes,
    available_colors: products.available_colors,
    allow_engraving: products.allow_engraving,
    category: {
      name: productCategories.name,
      production_time: productCategories.production_time,
      max_order_quantity: productCategories.max_order_quantity
    }
  })
  .from(products)
  .leftJoin(productCategories, eq(products.category_uuid, productCategories.uuid))
  .where(eq(products.uuid, id))
  .limit(1)

  if (!product[0]) {
    notFound()
  }

  if (!product[0].customizable) {
    redirect(`/marketplace/product/${id}`)
  }

  // 获取可用材质信息
  const availableMaterials = await db.select()
    .from(materials)
    .where(eq(materials.availability, true))

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">产品定制</h1>
        <p className="text-muted-foreground">
          个性化定制您的专属物品
        </p>
      </div>

      <ProductCustomizer
        product={product[0]}
        availableMaterials={availableMaterials}
      />
    </div>
  )
}