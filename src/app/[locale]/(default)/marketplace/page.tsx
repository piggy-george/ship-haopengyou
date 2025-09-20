import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CategoryFilter } from '@/components/product/CategoryFilter'
import { SearchBar } from '@/components/product/SearchBar'

export default async function MarketplacePage() {
  const session = await auth()
  const t = await getTranslations('marketplace')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">AI造物商城</h1>
        <p className="text-lg text-muted-foreground">
          发现独特的AI设计作品，定制属于您的专属物品
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64">
          <CategoryFilter />
        </aside>

        <main className="flex-1">
          <div className="mb-6">
            <SearchBar />
          </div>
          <ProductGrid />
        </main>
      </div>
    </div>
  )
}