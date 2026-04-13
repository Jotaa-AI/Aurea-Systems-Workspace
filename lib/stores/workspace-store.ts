import { create } from 'zustand'
import type { Workspace } from '@/types/database'

interface WorkspaceState {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),
}))
