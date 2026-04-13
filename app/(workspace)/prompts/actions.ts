'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Prompt } from '@/types/database'

export async function fetchPrompts(workspaceId: string): Promise<Prompt[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('parent_prompt_id', null)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Prompt[]
}

export async function fetchPrompt(promptId: string): Promise<Prompt> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()

  if (error) throw new Error(error.message)
  return data as Prompt
}

export async function fetchPromptVersions(promptId: string): Promise<Prompt[]> {
  const supabase = await createServiceClient()

  // Get the root prompt (if this is already a version, find the root)
  const prompt = await fetchPrompt(promptId)
  const rootId = prompt.parent_prompt_id ?? prompt.id

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .or(`id.eq.${rootId},parent_prompt_id.eq.${rootId}`)
    .order('version', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Prompt[]
}

export async function createPrompt(
  workspaceId: string,
  input: { title: string; content: string; category: string; tags?: string[] }
): Promise<Prompt> {
  const supabase = await createServiceClient()

  // Extract variables from content
  const variables = extractVariables(input.content)

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags ?? [],
      variables,
      version: 1,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/prompts')
  return data as Prompt
}

export async function updatePromptAsNewVersion(
  promptId: string,
  updates: { title?: string; content?: string; category?: string; tags?: string[] }
): Promise<Prompt> {
  const supabase = await createServiceClient()

  // Get current prompt
  const current = await fetchPrompt(promptId)
  const rootId = current.parent_prompt_id ?? current.id

  // Get latest version number
  const { data: versions } = await supabase
    .from('prompts')
    .select('version')
    .or(`id.eq.${rootId},parent_prompt_id.eq.${rootId}`)
    .order('version', { ascending: false })
    .limit(1)

  const latestVersion = versions?.[0]?.version ?? current.version
  const content = updates.content ?? current.content
  const variables = extractVariables(content)

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      workspace_id: current.workspace_id,
      title: updates.title ?? current.title,
      content,
      category: updates.category ?? current.category,
      tags: updates.tags ?? current.tags,
      variables,
      version: latestVersion + 1,
      parent_prompt_id: rootId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/prompts')
  return data as Prompt
}

export async function deletePrompt(promptId: string): Promise<void> {
  const supabase = await createServiceClient()

  // Delete the prompt and all its versions
  const prompt = await fetchPrompt(promptId)
  const rootId = prompt.parent_prompt_id ?? prompt.id

  // Delete versions first
  await supabase
    .from('prompts')
    .delete()
    .eq('parent_prompt_id', rootId)

  // Delete root
  await supabase
    .from('prompts')
    .delete()
    .eq('id', rootId)

  revalidatePath('/prompts')
}

function extractVariables(content: string): { name: string }[] {
  const matches = content.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []

  const unique = [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
  return unique.map((name) => ({ name }))
}
