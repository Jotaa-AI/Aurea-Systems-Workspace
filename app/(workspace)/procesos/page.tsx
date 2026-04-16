'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchProcesses, createProcess, createProcessFromTemplate } from './actions'
import { ProcessList } from '@/components/procesos/process-list'
import { TemplateGallery } from '@/components/procesos/template-gallery'
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
import { Plus, Search, Filter, ChevronDown, Loader2, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  PROCESS_CATEGORIES,
  PROCESS_STATUS_CONFIG,
  getCategoryConfig,
  type SOPTemplate,
} from '@/lib/process-config'
import type { Process, ProcessCategory, ProcessStatus } from '@/types/database'

type ViewTab = 'all' | 'templates'

export default function ProcesosPage() {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const queryClient = useQueryClient()
  const router = useRouter()

  const [view, setView] = useState<ViewTab>('all')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<ProcessCategory | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProcessStatus | null>(null)

  const { data: processes = [], isLoading } = useQuery({
    queryKey: ['processes', workspace?.id],
    queryFn: () => fetchProcesses(workspace!.id),
    enabled: !!workspace,
  })

  const filtered = useMemo(() => {
    let result = processes.filter((p) => !p.is_template)
    if (filterCategory) result = result.filter((p) => p.category === filterCategory)
    if (filterStatus) result = result.filter((p) => p.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [processes, search, filterCategory, filterStatus])

  async function handleCreateBlank() {
    if (!workspace) return
    try {
      const p = await createProcess(workspace.id, {
        title: 'Nuevo proceso',
        category: 'general',
      })
      queryClient.invalidateQueries({ queryKey: ['processes', workspace.id] })
      toast.success('Proceso creado')
      router.push(`/procesos/${p.id}`)
    } catch {
      toast.error('Error creando proceso')
    }
  }

  async function handleCreateFromTemplate(tpl: SOPTemplate) {
    if (!workspace) return
    try {
      const p = await createProcessFromTemplate(workspace.id, tpl)
      queryClient.invalidateQueries({ queryKey: ['processes', workspace.id] })
      toast.success(`SOP "${tpl.title}" creado`)
      router.push(`/procesos/${p.id}`)
    } catch {
      toast.error('Error creando SOP')
    }
  }

  function handleSelect(process: Process) {
    router.push(`/procesos/${process.id}`)
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Procesos" />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Procesos internos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Documenta y mapea todos los SOPs de tu agencia con metodología BPMN.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setView(view === 'templates' ? 'all' : 'templates')}>
                <LayoutTemplate className="h-4 w-4 mr-1.5" />
                {view === 'templates' ? 'Ver procesos' : 'Plantillas'}
              </Button>
              <Button onClick={handleCreateBlank}>
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo proceso
              </Button>
            </div>
          </div>

          {view === 'templates' ? (
            <TemplateGallery onSelectTemplate={handleCreateFromTemplate} />
          ) : (
            <>
              {/* Search + filters */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar procesos..."
                    className="pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0">
                    {filterCategory ? (
                      <>
                        <div className={cn('h-2.5 w-2.5 rounded-full', getCategoryConfig(filterCategory).color)} />
                        {getCategoryConfig(filterCategory).label}
                      </>
                    ) : (
                      <>
                        <Filter className="h-3.5 w-3.5" />
                        Categoría
                      </>
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterCategory(null)}>Todas</DropdownMenuItem>
                    {PROCESS_CATEGORIES.map((c) => (
                      <DropdownMenuItem key={c.value} onClick={() => setFilterCategory(c.value)}>
                        <span className="mr-2">{c.icon}</span>
                        {c.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0">
                    {filterStatus ? (
                      <Badge variant="secondary" className={cn('text-[10px]', PROCESS_STATUS_CONFIG[filterStatus].style)}>
                        {PROCESS_STATUS_CONFIG[filterStatus].label}
                      </Badge>
                    ) : (
                      'Estado'
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus(null)}>Todos</DropdownMenuItem>
                    {(Object.entries(PROCESS_STATUS_CONFIG) as [ProcessStatus, { label: string; style: string }][]).map(
                      ([val, cfg]) => (
                        <DropdownMenuItem key={val} onClick={() => setFilterStatus(val)}>
                          <Badge variant="secondary" className={cn('text-[10px]', cfg.style)}>
                            {cfg.label}
                          </Badge>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {(filterCategory || filterStatus) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      setFilterCategory(null)
                      setFilterStatus(null)
                    }}
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
                <span>{filtered.length} proceso{filtered.length !== 1 ? 's' : ''}</span>
                <span className="text-border">|</span>
                <span>{filtered.filter((p) => p.status === 'active').length} activos</span>
                <span>{filtered.filter((p) => p.status === 'draft').length} borradores</span>
              </div>

              {/* Process list */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ProcessList processes={filtered} onSelect={handleSelect} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
