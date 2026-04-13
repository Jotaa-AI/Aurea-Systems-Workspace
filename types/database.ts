export type Workspace = {
  id: string
  name: string
  created_at: string
}

export type WorkspaceMember = {
  workspace_id: string
  user_id: string
  role: 'owner' | 'member'
  created_at: string
}

export type Page = {
  id: string
  workspace_id: string
  parent_id: string | null
  title: string
  icon: string | null
  content: unknown
  is_favorite: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TaskBoard = {
  id: string
  workspace_id: string
  name: string
  columns: { id: string; title: string }[]
  created_at: string
}

export type Task = {
  id: string
  workspace_id: string
  board_id: string
  title: string
  description: string | null
  status: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id: string | null
  due_date: string | null
  client_id: string | null
  page_id: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace
        Insert: Omit<Workspace, 'id' | 'created_at'>
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>
      }
      workspace_members: {
        Row: WorkspaceMember
        Insert: Omit<WorkspaceMember, 'created_at'>
        Update: Partial<Omit<WorkspaceMember, 'workspace_id' | 'user_id'>>
      }
      pages: {
        Row: Page
        Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Page, 'id' | 'workspace_id' | 'created_by' | 'created_at'>>
      }
    }
  }
}
