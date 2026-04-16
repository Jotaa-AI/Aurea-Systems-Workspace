'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Process, ProcessCategory, ProcessStatus, ProcessStep } from '@/types/database'

/* ── Fetch all processes for a workspace ────────────── */
export async function fetchProcesses(workspaceId: string): Promise<Process[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })

  // Gracefully handle table-not-found (migration not yet applied)
  if (error) {
    if (error.message.includes('schema cache') || error.code === '42P01') {
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Process[]
}

/* ── Fetch single process ───────────────────────────── */
export async function fetchProcess(id: string): Promise<Process> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Process
}

/* ── Create process ─────────────────────────────────── */
export async function createProcess(
  workspaceId: string,
  input: {
    title?: string
    description?: string
    category?: ProcessCategory
    icon?: string
    steps?: ProcessStep[]
    tags?: string[]
    is_template?: boolean
  } = {}
): Promise<Process> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('processes')
    .insert({
      workspace_id: workspaceId,
      title: input.title ?? 'Sin título',
      description: input.description ?? '',
      category: input.category ?? 'general',
      icon: input.icon ?? '📋',
      steps: input.steps ?? [],
      tags: input.tags ?? [],
      is_template: input.is_template ?? false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/procesos')
  return data as Process
}

/* ── Create process from template ───────────────────── */
export async function createProcessFromTemplate(
  workspaceId: string,
  template: {
    title: string
    description: string
    category: ProcessCategory
    icon: string
    steps: ProcessStep[]
    tags: string[]
  }
): Promise<Process> {
  return createProcess(workspaceId, {
    title: template.title,
    description: template.description,
    category: template.category,
    icon: template.icon,
    steps: template.steps,
    tags: template.tags,
  })
}

/* ── Update process ─────────────────────────────────── */
export async function updateProcess(
  id: string,
  updates: Partial<
    Pick<
      Process,
      | 'title'
      | 'description'
      | 'category'
      | 'status'
      | 'icon'
      | 'steps'
      | 'content'
      | 'tags'
      | 'estimated_duration_minutes'
      | 'owner_id'
      | 'version'
      | 'parent_id'
    >
  >
): Promise<Process> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('processes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/procesos')
  return data as Process
}

/* ── Delete process ─────────────────────────────────── */
export async function deleteProcess(id: string): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase.from('processes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/procesos')
}

/* ── Duplicate process ──────────────────────────────── */
export async function duplicateProcess(id: string): Promise<Process> {
  const original = await fetchProcess(id)
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('processes')
    .insert({
      workspace_id: original.workspace_id,
      title: `${original.title} (copia)`,
      description: original.description,
      category: original.category,
      icon: original.icon,
      steps: original.steps,
      content: original.content,
      tags: original.tags,
      estimated_duration_minutes: original.estimated_duration_minutes,
      status: 'draft' as ProcessStatus,
      version: 1,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/procesos')
  return data as Process
}
