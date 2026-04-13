import { createClient } from '@/lib/supabase/server'
import { PageClient } from './page-client'

async function getAncestors(pageId: string) {
  const supabase = await createClient()
  const ancestors: { id: string; title: string; icon: string | null }[] = []
  let currentId: string | null = pageId

  // Walk up the parent chain
  for (let i = 0; i < 10; i++) {
    if (!currentId) break

    const { data }: { data: { id: string; title: string; icon: string | null; parent_id: string | null } | null } =
      await supabase
        .from('pages')
        .select('id, title, icon, parent_id')
        .eq('id', currentId)
        .single()

    if (!data) break

    if (data.id !== pageId) {
      ancestors.unshift({ id: data.id, title: data.title, icon: data.icon })
    }

    currentId = data.parent_id
  }

  return ancestors
}

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ancestors = await getAncestors(id)

  return <PageClient pageId={id} ancestors={ancestors} />
}
