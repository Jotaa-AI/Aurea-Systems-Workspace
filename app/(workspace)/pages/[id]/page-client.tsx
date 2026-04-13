'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePage } from '@/lib/hooks/use-pages'
import { updatePage, deletePage } from '../actions'
import { BlockEditor } from '@/components/editor/block-editor'
import { IconPicker } from '@/components/editor/icon-picker'
import { Breadcrumbs } from '@/components/editor/breadcrumbs'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Star, MoreHorizontal, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function PageClient({
  pageId,
  ancestors,
}: {
  pageId: string
  ancestors: { id: string; title: string; icon: string | null }[]
}) {
  const { data: page, isLoading } = usePage(pageId)
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTitleChange = useCallback(() => {
    if (!titleRef.current) return
    const newTitle = titleRef.current.textContent || 'Sin titulo'

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await updatePage(pageId, { title: newTitle })
      } catch {
        toast.error('Error guardando titulo')
      }
      setIsSaving(false)
    }, 800)
  }, [pageId])

  const handleToggleFavorite = useCallback(async () => {
    if (!page) return
    try {
      await updatePage(pageId, { is_favorite: !page.is_favorite })
      toast.success(page.is_favorite ? 'Quitado de favoritos' : 'Agregado a favoritos')
    } catch {
      toast.error('Error actualizando favorito')
    }
  }, [page, pageId])

  const handleIconChange = useCallback(
    async (icon: string | null) => {
      try {
        await updatePage(pageId, { icon })
      } catch {
        toast.error('Error actualizando icono')
      }
    },
    [pageId]
  )

  const handleDelete = useCallback(async () => {
    try {
      await deletePage(pageId)
      toast.success('Pagina eliminada')
      router.push('/pages')
    } catch {
      toast.error('Error eliminando pagina')
    }
  }, [pageId, router])

  if (isLoading || !page) {
    return (
      <>
        <Topbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar />
      <div className="mx-auto max-w-3xl px-8 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs ancestors={ancestors} />
        </div>

        {/* Header: icon + title + actions */}
        <div className="mb-6">
          <IconPicker value={page.icon} onChange={handleIconChange} />

          <div className="flex items-start gap-2 mt-1">
            <h1
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTitleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  ;(e.target as HTMLElement).blur()
                }
              }}
              className="flex-1 text-3xl font-bold tracking-tight outline-none focus:outline-none empty:before:content-['Sin_titulo'] empty:before:text-muted-foreground/40"
            >
              {page.title}
            </h1>

            <div className="flex items-center gap-1 pt-1">
              {isSaving && (
                <span className="text-xs text-muted-foreground mr-1">Guardando...</span>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggleFavorite}
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    page.is_favorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar pagina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Editor */}
        <BlockEditor pageId={pageId} initialContent={page.content} />
      </div>
    </>
  )
}
