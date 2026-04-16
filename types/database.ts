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

export type Client = {
  id: string
  workspace_id: string
  name: string
  ghl_location_id: string | null
  ghl_api_key_encrypted: string | null
  status: 'active' | 'onboarding' | 'paused' | 'churned'
  mrr: number
  notes: string | null
  health_score: number
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export type ClientMetric = {
  id: string
  client_id: string
  date: string
  leads_count: number
  appointments_count: number
  no_show_count: number
  revenue_generated: number
  created_at: string
}

export type Prompt = {
  id: string
  workspace_id: string
  title: string
  content: string
  category: string
  tags: string[]
  variables: { name: string; description?: string }[]
  version: number
  parent_prompt_id: string | null
  created_at: string
  updated_at: string
}

export type ContentPlatform = 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'x' | 'youtube' | 'threads'
export type ContentFormat = 'post' | 'reel' | 'story' | 'carousel' | 'video' | 'short' | 'article'
export type ContentStatus = 'idea' | 'draft' | 'ready' | 'scheduled' | 'published' | 'archived'

export type ContentItem = {
  id: string
  workspace_id: string
  platform: ContentPlatform
  format: ContentFormat
  hook: string | null
  caption: string
  hashtags: string[]
  media_urls: string[]
  status: ContentStatus
  scheduled_for: string | null
  published_at: string | null
  metrics: Record<string, unknown>
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

// ── Processes / SOPs (BPMN) ──────────────────────────────

export type ProcessCategory =
  | 'general'
  | 'ventas'
  | 'onboarding'
  | 'operaciones'
  | 'contenido'
  | 'soporte'
  | 'rrhh'
  | 'finanzas'

export type ProcessStatus = 'draft' | 'active' | 'review' | 'archived'

export type StepType = 'start' | 'task' | 'decision' | 'subprocess' | 'end'

export type ProcessStep = {
  id: string
  type: StepType
  title: string
  description: string
  responsible: string
  inputs: string[]
  outputs: string[]
  tools: string[]
  estimated_minutes: number | null
  notes: string
  /** Only for decision type: branches */
  conditions?: { label: string; nextStepId: string }[]
}

export type Process = {
  id: string
  workspace_id: string
  parent_id: string | null
  title: string
  description: string
  category: ProcessCategory
  status: ProcessStatus
  version: number
  owner_id: string | null
  icon: string | null
  steps: ProcessStep[]
  content: unknown
  tags: string[]
  estimated_duration_minutes: number | null
  is_template: boolean
  created_at: string
  updated_at: string
}

// ── Page comments (async discussions) ────────────────────

export type PageComment = {
  id: string
  workspace_id: string
  page_id: string
  parent_id: string | null
  author_id: string | null
  author_name: string
  author_email: string | null
  body: string
  resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
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
