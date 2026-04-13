'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'

export function useRealtimePages() {
  const queryClient = useQueryClient()
  const workspace = useWorkspaceStore((s) => s.workspace)

  useEffect(() => {
    if (!workspace) return

    const supabase = createClient()

    const channel = supabase
      .channel('pages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        (payload) => {
          // Invalidate the pages list
          queryClient.invalidateQueries({ queryKey: ['pages', workspace.id] })

          // If it's an update, also invalidate the specific page
          if (payload.eventType === 'UPDATE' && payload.new?.id) {
            queryClient.invalidateQueries({
              queryKey: ['pages', payload.new.id],
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspace, queryClient])
}
