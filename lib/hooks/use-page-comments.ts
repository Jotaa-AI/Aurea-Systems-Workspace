'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createPageComment,
  deletePageComment,
  fetchPageComments,
  toggleCommentResolved,
  updatePageComment,
} from '@/app/(workspace)/pages/comments-actions'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'

export function usePageComments(pageId: string) {
  return useQuery({
    queryKey: ['page-comments', pageId],
    queryFn: () => fetchPageComments(pageId),
    enabled: !!pageId,
  })
}

export function useCreatePageComment(pageId: string) {
  const queryClient = useQueryClient()
  const workspace = useWorkspaceStore((s) => s.workspace)

  return useMutation({
    mutationFn: (input: { body: string; parentId?: string | null }) => {
      if (!workspace) throw new Error('Workspace no disponible')
      return createPageComment({
        workspaceId: workspace.id,
        pageId,
        body: input.body,
        parentId: input.parentId ?? null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-comments', pageId] })
    },
  })
}

export function useUpdatePageComment(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      updatePageComment(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-comments', pageId] })
    },
  })
}

export function useDeletePageComment(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => deletePageComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-comments', pageId] })
    },
  })
}

export function useToggleCommentResolved(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      toggleCommentResolved(id, resolved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-comments', pageId] })
    },
  })
}

/**
 * Subscribe to live comment changes for a page. The server action
 * already invalidates queries, but realtime keeps other clients in
 * sync when collaborators comment from another device.
 */
export function useRealtimePageComments(pageId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!pageId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`page-comments-${pageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_comments',
          filter: `page_id=eq.${pageId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['page-comments', pageId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pageId, queryClient])
}
