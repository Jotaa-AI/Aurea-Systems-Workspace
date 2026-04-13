'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPromptVersions, updatePromptAsNewVersion } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Copy, Save, History, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prompt } from '@/types/database'

export function PromptDetailPanel({
  prompt,
  onClose,
  onUpdated,
}: {
  prompt: Prompt
  onClose: () => void
  onUpdated: (prompt: Prompt) => void
}) {
  const [content, setContent] = useState(prompt.content)
  const [title, setTitle] = useState(prompt.title)
  const [tagsInput, setTagsInput] = useState(prompt.tags.join(', '))
  const [showVersions, setShowVersions] = useState(false)
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: versions = [] } = useQuery({
    queryKey: ['prompt-versions', prompt.id],
    queryFn: () => fetchPromptVersions(prompt.id),
    enabled: showVersions,
  })

  // Extract variables from current content
  const variables = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g)
    if (!matches) return []
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
  }, [content])

  // Preview with variables replaced
  const previewContent = useMemo(() => {
    let result = content
    for (const [key, val] of Object.entries(previewVars)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`)
    }
    return result
  }, [content, previewVars])

  const hasChanges = content !== prompt.content || title !== prompt.title || tagsInput !== prompt.tags.join(', ')

  async function handleSaveVersion() {
    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const newVersion = await updatePromptAsNewVersion(prompt.id, {
        title,
        content,
        tags,
      })
      onUpdated(newVersion)
      toast.success(`Guardado como v${newVersion.version}`)
    } catch {
      toast.error('Error guardando')
    }
    setSaving(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(showPreview ? previewContent : content)
    toast.success('Copiado al clipboard')
  }

  return (
    <div className="w-[420px] shrink-0 border-l bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Prompt</span>
          <Badge variant="secondary" className="text-[10px]">v{prompt.version}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowVersions(!showVersions)}
            title="Historial"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowPreview(!showPreview)}
            title="Preview"
          >
            <Eye className={cn('h-3.5 w-3.5', showPreview && 'text-primary')} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
        />

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tags (separados por coma)</Label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ventas, clinica, follow-up"
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {showPreview ? 'Preview' : 'Contenido'}
          </Label>
          {showPreview ? (
            <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap font-mono min-h-[200px]">
              {previewContent}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono min-h-[200px]"
            />
          )}
        </div>

        {/* Variables */}
        {variables.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Variables ({variables.length})
            </Label>
            <div className="space-y-2">
              {variables.map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                    {`{{${v}}}`}
                  </Badge>
                  <Input
                    placeholder={`Valor de ${v}`}
                    value={previewVars[v] ?? ''}
                    onChange={(e) =>
                      setPreviewVars((prev) => ({ ...prev, [v]: e.target.value }))
                    }
                    className="text-xs h-7"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        {hasChanges && (
          <Button onClick={handleSaveVersion} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar como nueva version
          </Button>
        )}

        {/* Version history */}
        {showVersions && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Historial de versiones</Label>
              {versions.length === 0 ? (
                <p className="text-xs text-muted-foreground">Cargando...</p>
              ) : (
                <div className="space-y-1">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      className={cn(
                        'w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left',
                        v.id === prompt.id && 'bg-accent'
                      )}
                      onClick={() => {
                        setContent(v.content)
                        setTitle(v.title)
                        setTagsInput(v.tags.join(', '))
                        onUpdated(v)
                      }}
                    >
                      <span className="font-medium">v{v.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(v.created_at), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
