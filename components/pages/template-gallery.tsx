'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  PAGE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type PageTemplateCategory,
} from '@/lib/page-templates'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { createPage, createPageFromTemplate } from '@/app/(workspace)/pages/actions'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: string | null
}

type Filter = 'all' | PageTemplateCategory

export function TemplateGallery({ open, onOpenChange, parentId }: Props) {
  const router = useRouter()
  const workspace = useWorkspaceStore((s) => s.workspace)
  const [filter, setFilter] = useState<Filter>('all')
  const [creatingId, setCreatingId] = useState<string | null>(null)

  const templates = useMemo(
    () =>
      filter === 'all'
        ? PAGE_TEMPLATES
        : PAGE_TEMPLATES.filter((t) => t.category === filter),
    [filter]
  )

  async function handleBlank() {
    if (!workspace) return
    setCreatingId('__blank__')
    try {
      const page = await createPage(workspace.id, parentId ?? null)
      onOpenChange(false)
      router.push(`/pages/${page.id}`)
    } catch {
      toast.error('Error creando página')
    } finally {
      setCreatingId(null)
    }
  }

  async function handlePick(templateId: string) {
    if (!workspace) return
    setCreatingId(templateId)
    try {
      const page = await createPageFromTemplate(
        workspace.id,
        templateId,
        parentId ?? null
      )
      onOpenChange(false)
      router.push(`/pages/${page.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error creando página')
    } finally {
      setCreatingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            Crear nueva página
          </DialogTitle>
          <DialogDescription>
            Empieza en blanco o elige una plantilla pensada para trabajo de
            agencia.
          </DialogDescription>
        </DialogHeader>

        {/* Category filters */}
        <div className="flex items-center gap-1 px-6 py-3 border-b overflow-x-auto">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label={`Todas (${PAGE_TEMPLATES.length})`}
          />
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, meta]) => {
            const count = PAGE_TEMPLATES.filter(
              (t) => t.category === (key as PageTemplateCategory)
            ).length
            return (
              <FilterChip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key as PageTemplateCategory)}
                label={`${meta.label} (${count})`}
                accent={meta.color}
              />
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Blank option first */}
            <button
              onClick={handleBlank}
              disabled={creatingId !== null}
              className={cn(
                'group text-left rounded-lg border-2 border-dashed p-4 transition-all',
                'hover:border-foreground/40 hover:bg-accent/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex flex-col gap-2'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-muted text-lg">
                  {creatingId === '__blank__' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
                <span className="font-medium text-sm">Página en blanco</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Empieza desde cero sin ninguna estructura predefinida.
              </p>
            </button>

            {templates.map((t) => {
              const categoryMeta = TEMPLATE_CATEGORIES[t.category]
              return (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  disabled={creatingId !== null}
                  className={cn(
                    'group text-left rounded-lg border p-4 transition-all',
                    'hover:border-foreground/30 hover:bg-accent/50 hover:shadow-sm',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex flex-col gap-2'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded bg-muted text-lg">
                      {creatingId === t.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t.icon
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {t.name}
                      </div>
                      <div
                        className={cn(
                          'text-[10px] uppercase font-semibold tracking-wider',
                          categoryMeta.color
                        )}
                      >
                        {categoryMeta.label}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {t.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean
  onClick: () => void
  label: string
  accent?: string
}) {
  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'ghost'}
      onClick={onClick}
      className="h-7 text-xs shrink-0"
    >
      {accent && !active && <span className={cn('mr-1.5 text-base leading-none', accent)}>●</span>}
      {label}
    </Button>
  )
}
