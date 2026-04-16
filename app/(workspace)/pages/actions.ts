'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { getTemplate } from '@/lib/page-templates'
import type { Page } from '@/types/database'

export async function createPage(workspaceId: string, parentId?: string | null) {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('pages')
    .insert({
      workspace_id: workspaceId,
      parent_id: parentId ?? null,
      title: 'Sin titulo',
      content: [],
      is_favorite: false,
    } as any)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
  return data
}

export async function createPageFromTemplate(
  workspaceId: string,
  templateId: string,
  parentId?: string | null
) {
  const template = getTemplate(templateId)
  if (!template) throw new Error('Plantilla no encontrada')

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('pages')
    .insert({
      workspace_id: workspaceId,
      parent_id: parentId ?? null,
      title: template.defaultTitle,
      icon: template.icon,
      content: template.content,
      is_favorite: false,
    } as any)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
  return data
}

export async function updatePage(
  pageId: string,
  updates: {
    title?: string
    content?: unknown
    icon?: string | null
    is_favorite?: boolean
    parent_id?: string | null
  }
) {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', pageId)

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
  revalidatePath(`/pages/${pageId}`)
}

export async function deletePage(pageId: string) {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
}

export async function fetchPages(workspaceId: string): Promise<Page[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Page[]
}

export async function fetchPage(pageId: string): Promise<Page> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single()

  if (error) throw new Error(error.message)
  return data as Page
}

export async function updatePageContent(pageId: string, content: unknown) {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('pages')
    .update({ content })
    .eq('id', pageId)

  if (error) throw new Error(error.message)
}
