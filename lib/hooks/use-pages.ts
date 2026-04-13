'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import type { Page } from '@/types/database'

export function usePages() {
  const workspace = useWorkspaceStore((s) => s.workspace)

  return useQuery({
    queryKey: ['pages', workspace?.id],
    queryFn: async () => {
      if (!workspace) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Page[]
    },
    enabled: !!workspace,
  })
}

export function usePage(pageId: string) {
  return useQuery({
    queryKey: ['pages', pageId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single()

      if (error) throw error
      return data as Page
    },
  })
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      content,
    }: {
      pageId: string
      content: unknown
    }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)

      if (error) throw error
    },
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: ['pages', pageId] })
    },
  })
}

export type PageNode = Page & { children: PageNode[] }

export function buildPageTree(pages: Page[]): PageNode[] {
  const map = new Map<string | null, Page[]>()
  for (const page of pages) {
    const parentId = page.parent_id
    if (!map.has(parentId)) map.set(parentId, [])
    map.get(parentId)!.push(page)
  }

  function buildChildren(parentId: string | null): PageNode[] {
    const children = map.get(parentId) ?? []
    return children.map((page) => ({
      ...page,
      children: buildChildren(page.id),
    }))
  }

  return buildChildren(null)
}
