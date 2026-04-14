'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { ContentItem, ContentPlatform, ContentFormat, ContentStatus } from '@/types/database'

export async function fetchContentItems(workspaceId: string): Promise<ContentItem[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as ContentItem[]
}

export async function fetchContentItem(id: string): Promise<ContentItem> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as ContentItem
}

export async function createContentItem(
  workspaceId: string,
  input: {
    platform: ContentPlatform
    format: ContentFormat
    hook?: string
    caption?: string
    hashtags?: string[]
    status?: ContentStatus
    scheduled_for?: string | null
    media_urls?: string[]
    tags?: string[]
  }
): Promise<ContentItem> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      workspace_id: workspaceId,
      platform: input.platform,
      format: input.format,
      hook: input.hook ?? null,
      caption: input.caption ?? '',
      hashtags: input.hashtags ?? [],
      status: input.status ?? 'draft',
      scheduled_for: input.scheduled_for ?? null,
      media_urls: input.media_urls ?? [],
      tags: input.tags ?? [],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/content')
  return data as ContentItem
}

export async function updateContentItem(
  id: string,
  updates: Partial<Pick<ContentItem, 'platform' | 'format' | 'hook' | 'caption' | 'hashtags' | 'media_urls' | 'status' | 'scheduled_for' | 'published_at' | 'metrics' | 'notes' | 'tags'>>
): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/content')
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/content')
}

export async function uploadContentMedia(formData: FormData): Promise<string> {
  const supabase = await createServiceClient()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `content/${fileName}`

  const { error } = await supabase.storage
    .from('content-media')
    .upload(path, file)

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage
    .from('content-media')
    .getPublicUrl(path)

  return urlData.publicUrl
}

export async function deleteContentMedia(url: string): Promise<void> {
  const supabase = await createServiceClient()
  // Extract path from URL
  const match = url.match(/content-media\/(.+)$/)
  if (!match) return

  await supabase.storage
    .from('content-media')
    .remove([match[1]])
}
