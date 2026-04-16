'use client'

import { useState, useCallback, useRef } from 'react'
import { updateContentItem, deleteContentItem } from '@/app/(workspace)/content/actions'
import { generateHook, generateCaption, generateHashtags } from '@/app/(workspace)/content/ai-actions'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { MediaUpload } from './media-upload'
import { PLATFORMS, FORMAT_LABELS, STATUS_CONFIG, getPlatformConfig } from '@/lib/content-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { X, Trash2, ChevronDown, Hash, Calendar, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ContentItem, ContentPlatform, ContentFormat, ContentStatus } from '@/types/database'

export function ContentEditor({
  item,
  onClose,
  onUpdate,
  onDelete,
}: {
  item: ContentItem
  onClose: () => void
  onUpdate: (item: ContentItem) => void
  onDelete: (id: string) => void
}) {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const [caption, setCaption] = useState(item.caption)
  const [hook, setHook] = useState(item.hook ?? '')
  const [hashtagsInput, setHashtagsInput] = useState(item.hashtags.join(' '))
  const [notes, setNotes] = useState(item.notes ?? '')
  const [scheduledFor, setScheduledFor] = useState(item.scheduled_for?.slice(0, 16) ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [generatingHook, setGeneratingHook] = useState(false)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [generatingHashtags, setGeneratingHashtags] = useState(false)

  const platformCfg = getPlatformConfig(item.platform)
  const statusCfg = STATUS_CONFIG[item.status]

  const saveField = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateContentItem(item.id, { [field]: value })
        onUpdate({ ...item, [field]: value } as ContentItem)
      } catch {
        toast.error('Error guardando')
      }
    },
    [item, onUpdate]
  )

  const debouncedSave = useCallback(
    (field: string, value: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => saveField(field, value), 800)
    },
    [saveField]
  )

  const handleDelete = useCallback(async () => {
    try {
      await deleteContentItem(item.id)
      onDelete(item.id)
      toast.success('Contenido eliminado')
    } catch {
      toast.error('Error eliminando')
    }
  }, [item.id, onDelete])

  async function handleGenerateHook() {
    if (!workspace) return
    setGeneratingHook(true)
    try {
      const result = await generateHook(workspace.id, item.platform, item.format, caption || undefined)
      setHook(result)
      await saveField('hook', result)
      toast.success('Hook generado')
    } catch {
      toast.error('Error generando hook. Verifica la configuracion de IA.')
    } finally {
      setGeneratingHook(false)
    }
  }

  async function handleGenerateCaption() {
    if (!workspace) return
    setGeneratingCaption(true)
    try {
      const result = await generateCaption(workspace.id, item.platform, item.format, hook || undefined)
      setCaption(result)
      await saveField('caption', result)
      toast.success('Caption generado')
    } catch {
      toast.error('Error generando caption. Verifica la configuracion de IA.')
    } finally {
      setGeneratingCaption(false)
    }
  }

  async function handleGenerateHashtags() {
    if (!workspace) return
    setGeneratingHashtags(true)
    try {
      const result = await generateHashtags(workspace.id, item.platform, hook || undefined, caption || undefined)
      const text = result.join(' ')
      setHashtagsInput(text)
      await saveField('hashtags', result)
      toast.success('Hashtags generados')
    } catch {
      toast.error('Error generando hashtags')
    } finally {
      setGeneratingHashtags(false)
    }
  }

  return (
    <div className="w-[440px] shrink-0 border-l bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', platformCfg.color)} />
          <span className="text-sm font-medium">{platformCfg.label}</span>
          <Badge variant="secondary" className="text-[10px]">
            {FORMAT_LABELS[item.format]}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Status + Platform + Format */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Estado</Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs w-full justify-between hover:bg-accent transition-colors">
                <Badge variant="secondary" className={cn('text-[10px]', statusCfg.style)}>{statusCfg.label}</Badge>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.entries(STATUS_CONFIG) as [ContentStatus, typeof statusCfg][]).map(([val, cfg]) => (
                  <DropdownMenuItem key={val} onClick={() => saveField('status', val)}>
                    <Badge variant="secondary" className={cn('text-[10px]', cfg.style)}>{cfg.label}</Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Plataforma</Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs w-full justify-between hover:bg-accent transition-colors">
                {platformCfg.label}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PLATFORMS.map((p) => (
                  <DropdownMenuItem key={p.value} onClick={() => saveField('platform', p.value)}>
                    <div className={cn('h-2.5 w-2.5 rounded-full mr-2', p.color)} />
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Formato</Label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs w-full justify-between hover:bg-accent transition-colors">
                {FORMAT_LABELS[item.format]}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {platformCfg.formats.map((f) => (
                  <DropdownMenuItem key={f} onClick={() => saveField('format', f)}>
                    {FORMAT_LABELS[f]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Programar publicacion
          </Label>
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => {
              setScheduledFor(e.target.value)
              const val = e.target.value ? new Date(e.target.value).toISOString() : null
              saveField('scheduled_for', val)
              if (val) saveField('status', 'scheduled')
            }}
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Media */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Media</Label>
          <MediaUpload
            urls={item.media_urls}
            onChange={(urls) => saveField('media_urls', urls)}
          />
        </div>

        <Separator />

        {/* Hook */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Hook / Titulo</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              onClick={handleGenerateHook}
              disabled={generatingHook}
            >
              {generatingHook ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generar con IA
            </Button>
          </div>
          <Input
            value={hook}
            onChange={(e) => {
              setHook(e.target.value)
              debouncedSave('hook', e.target.value)
            }}
            placeholder="El gancho que captura atencion..."
          />
        </div>

        {/* Caption */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Caption / Copy</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              onClick={handleGenerateCaption}
              disabled={generatingCaption}
            >
              {generatingCaption ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generar con IA
            </Button>
          </div>
          <textarea
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value)
              debouncedSave('caption', e.target.value)
            }}
            placeholder="Texto de la publicacion..."
            rows={6}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right">{caption.length} caracteres</p>
        </div>

        {/* Hashtags */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Hashtags
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              onClick={handleGenerateHashtags}
              disabled={generatingHashtags}
            >
              {generatingHashtags ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generar con IA
            </Button>
          </div>
          <Input
            value={hashtagsInput}
            onChange={(e) => {
              setHashtagsInput(e.target.value)
              const tags = e.target.value.split(/[\s,]+/).filter(Boolean)
              debouncedSave('hashtags', tags)
            }}
            placeholder="#marketing #clinica #estetica"
            className="text-sm"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Notas internas</Label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              debouncedSave('notes', e.target.value)
            }}
            placeholder="Notas para el equipo..."
            rows={3}
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>
    </div>
  )
}
