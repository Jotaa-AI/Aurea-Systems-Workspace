'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPage(workspaceId: string, parentId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('pages')
    .insert({
      workspace_id: workspaceId,
      parent_id: parentId ?? null,
      title: 'Sin titulo',
      content: [],
      is_favorite: false,
      created_by: user.id,
    })
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
  const supabase = await createClient()
  const { error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', pageId)

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
  revalidatePath(`/pages/${pageId}`)
}

export async function deletePage(pageId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)

  if (error) throw new Error(error.message)

  revalidatePath('/pages')
}
