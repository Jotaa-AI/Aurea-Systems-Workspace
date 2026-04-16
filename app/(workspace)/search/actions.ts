'use server'

import { createServiceClient } from '@/lib/supabase/server'

export type SearchResultType =
  | 'page'
  | 'task'
  | 'client'
  | 'content'
  | 'process'
  | 'prompt'

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  icon?: string | null
  url: string
  updatedAt: string
  score: number
}

/**
 * Global workspace search across all content types.
 * Uses ILIKE for case-insensitive partial matching. Keeps things
 * lean — no tsvector setup required, works well for <10k rows.
 */
export async function searchWorkspace(
  workspaceId: string,
  query: string,
  limit = 8
): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 2) return []

  const supabase = await createServiceClient()
  const like = `%${query.trim()}%`

  const [pages, tasks, clients, content, processes, prompts] = await Promise.all([
    supabase
      .from('pages')
      .select('id, title, icon, updated_at')
      .eq('workspace_id', workspaceId)
      .ilike('title', like)
      .order('updated_at', { ascending: false })
      .limit(limit),

    supabase
      .from('tasks')
      .select('id, title, description, status, updated_at')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(limit),

    supabase
      .from('clients')
      .select('id, name, status, notes, updated_at')
      .eq('workspace_id', workspaceId)
      .or(`name.ilike.${like},notes.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(limit),

    supabase
      .from('content_items')
      .select('id, hook, caption, platform, status, updated_at')
      .eq('workspace_id', workspaceId)
      .or(`hook.ilike.${like},caption.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(limit),

    // Processes table might not exist on older DBs — handle gracefully
    supabase
      .from('processes')
      .select('id, title, description, icon, category, updated_at')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(limit),

    supabase
      .from('prompts')
      .select('id, title, content, category, updated_at')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('updated_at', { ascending: false })
      .limit(limit),
  ])

  const results: SearchResult[] = []
  const q = query.toLowerCase()

  // Helper to rank results — higher = better
  const rank = (text: string | null | undefined) => {
    if (!text) return 0
    const t = text.toLowerCase()
    if (t === q) return 100
    if (t.startsWith(q)) return 80
    if (t.includes(q)) return 50
    return 20
  }

  for (const p of pages.data ?? []) {
    results.push({
      id: p.id,
      type: 'page',
      title: p.title || 'Sin título',
      icon: p.icon,
      url: `/pages/${p.id}`,
      updatedAt: p.updated_at,
      score: rank(p.title),
    })
  }

  for (const t of tasks.data ?? []) {
    results.push({
      id: t.id,
      type: 'task',
      title: t.title,
      subtitle: t.status,
      url: `/tasks?task=${t.id}`,
      updatedAt: t.updated_at,
      score: rank(t.title) || rank(t.description) - 10,
    })
  }

  for (const c of clients.data ?? []) {
    results.push({
      id: c.id,
      type: 'client',
      title: c.name,
      subtitle: c.status,
      url: `/clients/${c.id}`,
      updatedAt: c.updated_at,
      score: rank(c.name),
    })
  }

  for (const i of content.data ?? []) {
    results.push({
      id: i.id,
      type: 'content',
      title: i.hook || (i.caption ?? '').slice(0, 60) || 'Sin título',
      subtitle: `${i.platform} · ${i.status}`,
      url: `/content?item=${i.id}`,
      updatedAt: i.updated_at,
      score: rank(i.hook) || rank(i.caption) - 10,
    })
  }

  if (!processes.error) {
    for (const p of processes.data ?? []) {
      results.push({
        id: p.id,
        type: 'process',
        title: p.title,
        subtitle: p.category,
        icon: p.icon,
        url: `/procesos/${p.id}`,
        updatedAt: p.updated_at,
        score: rank(p.title) || rank(p.description) - 10,
      })
    }
  }

  for (const p of prompts.data ?? []) {
    results.push({
      id: p.id,
      type: 'prompt',
      title: p.title,
      subtitle: p.category,
      url: `/prompts?prompt=${p.id}`,
      updatedAt: p.updated_at,
      score: rank(p.title) || rank(p.content) - 10,
    })
  }

  // Sort by score desc, then by date desc
  return results
    .sort((a, b) => b.score - a.score || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20)
}
