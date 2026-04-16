'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchContentItems, createContentItem } from './actions'
import { ContentGrid } from '@/components/content/content-grid'
import { ContentCalendar } from '@/components/content/content-calendar'
import { ContentEditor } from '@/components/content/content-editor'
import { BrandIdentityPanel } from '@/components/content/brand-identity-panel'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  LayoutGrid,
  CalendarDays,
  Loader2,
  ChevronDown,
  Filter,
  Fingerprint,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PLATFORMS, STATUS_CONFIG, FORMAT_LABELS, getPlatformConfig } from '@/lib/content-config'
import type { ContentItem, ContentPlatform, ContentFormat, ContentStatus } from '@/types/database'

type SectionTab = 'content' | 'brand'
type ViewMode = 'grid' | 'calendar'

export default function ContentPage() {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const queryClient = useQueryClient()

  const [section, setSection] = useState<SectionTab>('content')
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<ContentPlatform | null>(null)
  const [filterStatus, setFilterStatus] = useState<ContentStatus | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  // Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState<ContentPlatform>('instagram')
  const [newFormat, setNewFormat] = useState<ContentFormat>('post')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['content', workspace?.id],
    queryFn: () => fetchContentItems(workspace!.id),
    enabled: !!workspace,
  })

  const filtered = useMemo(() => {
    let result = items
    if (filterPlatform) result = result.filter((i) => i.platform === filterPlatform)
    if (filterStatus) result = result.filter((i) => i.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          (i.hook ?? '').toLowerCase().includes(q) ||
          i.caption.toLowerCase().includes(q) ||
          i.hashtags.some((h) => h.toLowerCase().includes(q))
      )
    }
    return result
  }, [items, search, filterPlatform, filterStatus])

  function handlePlatformChange(platform: ContentPlatform) {
    setNewPlatform(platform)
    const cfg = getPlatformConfig(platform)
    setNewFormat(cfg.formats[0])
  }

  async function handleCreate() {
    if (!workspace) return
    try {
      const item = await createContentItem(workspace.id, {
        platform: newPlatform,
        format: newFormat,
        status: 'draft',
      })
      queryClient.invalidateQueries({ queryKey: ['content', workspace.id] })
      toast.success('Contenido creado')
      setDialogOpen(false)
      setSelectedItem(item)
    } catch {
      toast.error('Error creando contenido')
    }
  }

  function handleItemUpdate(updated: ContentItem) {
    setSelectedItem(updated)
    queryClient.invalidateQueries({ queryKey: ['content', workspace?.id] })
  }

  function handleItemDelete(id: string) {
    setSelectedItem(null)
    queryClient.invalidateQueries({ queryKey: ['content', workspace?.id] })
  }

  const selectedPlatformCfg = getPlatformConfig(newPlatform)

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Contenido" />

      {/* Section tabs */}
      <div className="border-b px-8">
        <div className="flex items-center gap-6">
          <button
            className={cn(
              'relative py-3 text-sm font-medium transition-colors',
              section === 'content'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setSection('content')}
          >
            Publicaciones
            {section === 'content' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            className={cn(
              'relative py-3 text-sm font-medium transition-colors flex items-center gap-1.5',
              section === 'brand'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => { setSection('brand'); setSelectedItem(null) }}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            Identidad de marca
            {section === 'brand' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {section === 'brand' ? (
        <BrandIdentityPanel />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl px-8 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Estrategia de contenido</h1>
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center rounded-md border p-0.5">
                    <button
                      className={cn(
                        'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                        view === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setView('grid')}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      Galeria
                    </button>
                    <button
                      className={cn(
                        'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                        view === 'calendar' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setView('calendar')}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      Calendario
                    </button>
                  </div>

                  {/* New content button */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                      <Plus className="h-4 w-4" />
                      Nuevo contenido
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crear contenido</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Plataforma</label>
                          <div className="grid grid-cols-4 gap-2">
                            {PLATFORMS.map((p) => (
                              <button
                                key={p.value}
                                className={cn(
                                  'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-all hover:border-foreground/30',
                                  newPlatform === p.value
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border'
                                )}
                                onClick={() => handlePlatformChange(p.value)}
                              >
                                <div className={cn('h-4 w-4 rounded-full', p.color)} />
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Formato</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatformCfg.formats.map((f) => (
                              <button
                                key={f}
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                                  newFormat === f
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border hover:border-foreground/30'
                                )}
                                onClick={() => setNewFormat(f)}
                              >
                                {FORMAT_LABELS[f]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreate}>Crear</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Search + filters */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar contenido..."
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0">
                    {filterPlatform ? (
                      <>
                        <div className={cn('h-2.5 w-2.5 rounded-full', getPlatformConfig(filterPlatform).color)} />
                        {getPlatformConfig(filterPlatform).label}
                      </>
                    ) : (
                      <>
                        <Filter className="h-3.5 w-3.5" />
                        Plataforma
                      </>
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterPlatform(null)}>Todas</DropdownMenuItem>
                    {PLATFORMS.map((p) => (
                      <DropdownMenuItem key={p.value} onClick={() => setFilterPlatform(p.value)}>
                        <div className={cn('h-2.5 w-2.5 rounded-full mr-2', p.color)} />
                        {p.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0">
                    {filterStatus ? (
                      <Badge variant="secondary" className={cn('text-[10px]', STATUS_CONFIG[filterStatus].style)}>
                        {STATUS_CONFIG[filterStatus].label}
                      </Badge>
                    ) : (
                      'Estado'
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus(null)}>Todos</DropdownMenuItem>
                    {(Object.entries(STATUS_CONFIG) as [ContentStatus, { label: string; style: string }][]).map(([val, cfg]) => (
                      <DropdownMenuItem key={val} onClick={() => setFilterStatus(val)}>
                        <Badge variant="secondary" className={cn('text-[10px]', cfg.style)}>{cfg.label}</Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {(filterPlatform || filterStatus) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => { setFilterPlatform(null); setFilterStatus(null) }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
                <span>{filtered.length} contenido{filtered.length !== 1 ? 's' : ''}</span>
                <span className="text-border">|</span>
                <span>{filtered.filter((i) => i.status === 'draft').length} borradores</span>
                <span>{filtered.filter((i) => i.status === 'scheduled').length} programados</span>
                <span>{filtered.filter((i) => i.status === 'published').length} publicados</span>
              </div>

              {/* Content view */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : view === 'grid' ? (
                <ContentGrid items={filtered} onSelectItem={setSelectedItem} />
              ) : (
                <ContentCalendar items={filtered} onSelectItem={setSelectedItem} />
              )}
            </div>
          </div>

          {/* Editor panel */}
          {selectedItem && (
            <ContentEditor
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
            />
          )}
        </div>
      )}
    </div>
  )
}
