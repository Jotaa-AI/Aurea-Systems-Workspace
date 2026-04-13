import { createServiceClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { WorkspaceInitializer } from '@/components/layout/workspace-initializer'

async function getOrCreateWorkspace() {
  const supabase = await createServiceClient()

  // Try to get existing workspace
  const { data: existing } = await supabase
    .from('workspaces')
    .select('id, name, created_at')
    .limit(1)
    .single()

  if (existing) return existing

  // Create default workspace if none exists
  const { data: created } = await supabase
    .from('workspaces')
    .insert({ name: 'Aurea Systems' })
    .select('id, name, created_at')
    .single()

  return created!
}

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const workspace = await getOrCreateWorkspace()

  return (
    <div className="flex h-screen overflow-hidden">
      <WorkspaceInitializer workspace={workspace} />
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
