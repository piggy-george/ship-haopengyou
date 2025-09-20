'use client'

import { useSession } from 'next-auth/react'
import { useAppContext } from '@/contexts/app'
import { StatsCards } from '@/components/creator/StatsCards'
import { RevenueChart } from '@/components/creator/RevenueChart'
import { RecentOrders } from '@/components/creator/RecentOrders'
import { TopProducts } from '@/components/creator/TopProducts'
import { useEffect } from 'react'

export default function CreatorDashboardPage() {
  const { data: session } = useSession()
  const { setShowSignModal } = useAppContext()

  useEffect(() => {
    if (!session) {
      setShowSignModal(true)
    }
  }, [session, setShowSignModal])

  // TODO: 检查用户是否为已认证创作者

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">创作者中心</h1>
        <p className="text-muted-foreground mt-2">
          管理您的作品，追踪收益，发展您的创意事业
        </p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-2 gap-8">
        <RevenueChart />
        <TopProducts />
      </div>

      <RecentOrders />
    </div>
  )
}