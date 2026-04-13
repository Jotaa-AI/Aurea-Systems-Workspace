'use client'

import { useEffect } from 'react'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import type { Workspace } from '@/types/database'

export function WorkspaceInitializer({ workspace }: { workspace: Workspace }) {
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace)

  useEffect(() => {
    setWorkspace(workspace)
  }, [workspace, setWorkspace])

  return null
}
