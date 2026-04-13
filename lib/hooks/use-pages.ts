'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchPages, fetchPage, updatePageContent } from '@/app/(workspace)/pages/actions'
import type { Page } from '@/types/database'

export function usePages() {
  const workspace = useWorkspaceStore((s) => s.workspace)

  return useQuery({
    queryKey: ['pages', workspace?.id],
    queryFn: async () => {
      if (!workspace) return []
      return fetchPages(workspace.id)
    },
    enabled: !!workspace,
  })
}

export function usePage(pageId: string) {
  return useQuery({
    queryKey: ['pages', pageId],
    queryFn: () => fetchPage(pageId),
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
      await updatePageContent(pageId, content)
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
