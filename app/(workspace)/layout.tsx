import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { WorkspaceInitializer } from '@/components/layout/workspace-initializer'

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, created_at)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership?.workspaces) {
    redirect('/login')
  }

  const workspace = membership.workspaces as unknown as {
    id: string
    name: string
    created_at: string
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <WorkspaceInitializer workspace={workspace} />
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
