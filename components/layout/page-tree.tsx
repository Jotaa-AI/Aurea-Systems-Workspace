'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePages, buildPageTree, type PageNode } from '@/lib/hooks/use-pages'
import { useRealtimePages } from '@/lib/hooks/use-realtime-pages'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { TemplateGallery } from '@/components/pages/template-gallery'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  FileText,
  Plus,
  Star,
  Loader2,
} from 'lucide-react'

function PageTreeItem({
  page,
  depth = 0,
  activePath,
  onAddChild,
}: {
  page: PageNode
  depth?: number
  activePath?: string
  onAddChild: (parentId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const isActive = activePath === page.id
  const hasChildren = page.children.length > 0

  function handleAddChild(e: React.MouseEvent) {
    e.stopPropagation()
    setExpanded(true)
    onAddChild(page.id)
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-0.5 rounded-md px-1 py-1 text-sm cursor-pointer transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => router.push(`/pages/${page.id}`)}
      >
        <button
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-sidebar-accent',
            !hasChildren && 'invisible'
          )}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform',
              expanded && 'rotate-90'
            )}
          />
        </button>

        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">
          {page.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>

        <span className="flex-1 truncate ml-1">{page.title}</span>

        {page.is_favorite && (
          <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
        )}

        <button
          className="h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent transition-opacity flex"
          onClick={handleAddChild}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {expanded && hasChildren && (
        <div>
          {page.children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              depth={depth + 1}
              activePath={activePath}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PageTree({ activePath }: { activePath?: string }) {
  const { data: pages, isLoading } = usePages()
  const router = useRouter()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryParentId, setGalleryParentId] = useState<string | null>(null)

  useRealtimePages()

  const tree = pages ? buildPageTree(pages) : []
  const favorites = pages?.filter((p) => p.is_favorite) ?? []

  function openGallery(parentId: string | null) {
    setGalleryParentId(parentId)
    setGalleryOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <TemplateGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        parentId={galleryParentId}
      />

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <p className="mb-1 px-3 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
            Favoritos
          </p>
          {favorites.map((page) => (
            <div
              key={page.id}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1 text-sm cursor-pointer transition-colors',
                activePath === page.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              )}
              onClick={() => router.push(`/pages/${page.id}`)}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">
                {page.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
              </span>
              <span className="truncate">{page.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Page tree */}
      <div>
        <div className="flex items-center justify-between px-3 mb-1">
          <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
            Paginas
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => openGallery(null)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {tree.map((page) => (
          <PageTreeItem
            key={page.id}
            page={page}
            activePath={activePath}
            onAddChild={(parentId) => openGallery(parentId)}
          />
        ))}
        {tree.length === 0 && (
          <button
            onClick={() => openGallery(null)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Crear primera pagina</span>
          </button>
        )}
      </div>
    </div>
  )
}
