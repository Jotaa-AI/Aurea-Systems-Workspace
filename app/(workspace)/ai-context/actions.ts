'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export type AIContext = {
  id: string
  workspace_id: string
  brand_name: string
  brand_description: string
  target_audience: string
  tone_of_voice: string
  key_topics: string[]
  differentiators: string
  language: string
  extra_instructions: string
  created_at: string
  updated_at: string
}

export async function fetchAIContext(workspaceId: string): Promise<AIContext | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('ai_contexts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  return data as AIContext | null
}

export async function upsertAIContext(
  workspaceId: string,
  input: Partial<Omit<AIContext, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>
): Promise<AIContext> {
  const supabase = await createServiceClient()

  // Check if exists
  const { data: existing } = await supabase
    .from('ai_contexts')
    .select('id')
    .eq('workspace_id', workspaceId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('ai_contexts')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/ai-context')
    return data as AIContext
  }

  const { data, error } = await supabase
    .from('ai_contexts')
    .insert({ workspace_id: workspaceId, ...input })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/ai-context')
  return data as AIContext
}
