'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePages } from '@/lib/hooks/use-pages'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { deletePage } from './actions'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { TemplateGallery } from '@/components/pages/template-gallery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  FileText,
  Star,
  MoreHorizontal,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Page } from '@/types/database'

export default function PagesIndex() {
  const { data: pages, isLoading } = usePages()
  const workspace = useWorkspaceStore((s) => s.workspace)
  const router = useRouter()
  const [galleryOpen, setGalleryOpen] = useState(false)

  const rootPages = pages?.filter((p) => !p.parent_id) ?? []

  async function handleDelete(e: React.MouseEvent, pageId: string) {
    e.stopPropagation()
    try {
      await deletePage(pageId)
      toast.success('Pagina eliminada')
    } catch {
      toast.error('Error eliminando pagina')
    }
  }

  return (
    <>
      <Topbar title="Paginas" />
      <TemplateGallery open={galleryOpen} onOpenChange={setGalleryOpen} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Paginas</h1>
          <Button onClick={() => setGalleryOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva pagina
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rootPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay paginas todavia
            </p>
            <Button onClick={() => setGalleryOpen(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Crear primera pagina
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {rootPages.map((page) => (
              <PageRow
                key={page.id}
                page={page}
                childCount={pages?.filter((p) => p.parent_id === page.id).length ?? 0}
                onClick={() => router.push(`/pages/${page.id}`)}
                onDelete={(e) => handleDelete(e, page.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function PageRow({
  page,
  childCount,
  onClick,
  onDelete,
}: {
  page: Page
  childCount: number
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className="group flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg bg-muted">
        {page.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{page.title}</span>
          {page.is_favorite && (
            <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>
            {formatDistanceToNow(new Date(page.updated_at), {
              addSuffix: true,
              locale: es,
            })}
          </span>
          {childCount > 0 && (
            <span>· {childCount} subpagina{childCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
