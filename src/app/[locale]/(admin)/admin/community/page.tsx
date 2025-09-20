import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PostModerationPanel } from '@/components/admin/PostModerationPanel'

export default async function CommunityAdminPage() {
  const session = await auth()

  // 检查管理员权限
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">社区内容审核</h1>
        <p className="text-muted-foreground">
          管理和审核用户提交的社区作品
        </p>
      </div>

      <PostModerationPanel />
    </div>
  )
}