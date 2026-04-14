import type { ContentPlatform, ContentFormat, ContentStatus } from '@/types/database'

export const PLATFORMS: { value: ContentPlatform; label: string; color: string; formats: ContentFormat[] }[] = [
  { value: 'instagram', label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', formats: ['post', 'reel', 'story', 'carousel'] },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black dark:bg-zinc-800', formats: ['video', 'short'] },
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600', formats: ['post', 'reel', 'video', 'story'] },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700', formats: ['post', 'article', 'carousel', 'video'] },
  { value: 'x', label: 'X', color: 'bg-black dark:bg-zinc-800', formats: ['post', 'video'] },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600', formats: ['video', 'short'] },
  { value: 'threads', label: 'Threads', color: 'bg-black dark:bg-zinc-800', formats: ['post', 'carousel'] },
]

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  post: 'Post',
  reel: 'Reel',
  story: 'Story',
  carousel: 'Carousel',
  video: 'Video',
  short: 'Short',
  article: 'Articulo',
}

export const STATUS_CONFIG: Record<ContentStatus, { label: string; style: string }> = {
  idea: { label: 'Idea', style: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  draft: { label: 'Borrador', style: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  ready: { label: 'Listo', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  scheduled: { label: 'Programado', style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  published: { label: 'Publicado', style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  archived: { label: 'Archivado', style: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500' },
}

export function getPlatformConfig(platform: ContentPlatform) {
  return PLATFORMS.find((p) => p.value === platform)!
}
