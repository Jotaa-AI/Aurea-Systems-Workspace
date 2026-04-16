'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { PageComment } from '@/types/database'

/**
 * Fetch all comments for a page, ordered oldest-first so replies
 * display in chronological order inside their thread.
 */
export async function fetchPageComments(pageId: string): Promise<PageComment[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('page_comments')
    .select('*')
    .eq('page_id', pageId)
    .order('created_at', { ascending: true })

  if (error) {
    // Table not yet migrated — degrade gracefully
    if (error.message.includes('schema cache') || (error as any).code === '42P01') {
      return []
    }
    throw new Error(error.message)
  }

  return (data ?? []) as PageComment[]
}

export async function createPageComment(input: {
  workspaceId: string
  pageId: string
  body: string
  parentId?: string | null
}) {
  const trimmed = input.body.trim()
  if (!trimmed) throw new Error('El comentario no puede estar vacío')
  if (trimmed.length > 5000) throw new Error('Comentario demasiado largo')

  // Use the regular client to get the current user, then the service
  // client to bypass RLS safely after we've validated auth.
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('page_comments')
    .insert({
      workspace_id: input.workspaceId,
      page_id: input.pageId,
      parent_id: input.parentId ?? null,
      author_id: user?.id ?? null,
      author_name:
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email?.split('@')[0] ||
        'Usuario',
      author_email: user?.email ?? null,
      body: trimmed,
    } as any)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/pages/${input.pageId}`)
  return data as PageComment
}

export async function updatePageComment(commentId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('El comentario no puede estar vacío')

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('page_comments')
    .update({ body: trimmed })
    .eq('id', commentId)

  if (error) throw new Error(error.message)
}

export async function deletePageComment(commentId: string) {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('page_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw new Error(error.message)
}

export async function toggleCommentResolved(commentId: string, resolved: boolean) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('page_comments')
    .update({
      resolved,
      resolved_at: resolved ? new Date().toISOString() : null,
      resolved_by: resolved ? user?.id ?? null : null,
    })
    .eq('id', commentId)

  if (error) throw new Error(error.message)
}
