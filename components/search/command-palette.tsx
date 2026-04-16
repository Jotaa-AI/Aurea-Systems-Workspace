'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { searchWorkspace, type SearchResult, type SearchResultType } from '@/app/(workspace)/search/actions'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  FileText,
  CheckSquare,
  Users,
  Calendar,
  Sparkles,
  GitBranchPlus,
  Search,
  Loader2,
  LayoutDashboard,
  Key,
  Settings,
  Hash,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TYPE_META: Record<SearchResultType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  page:    { label: 'Página',    icon: FileText,        color: 'text-blue-400' },
  task:    { label: 'Tarea',     icon: CheckSquare,     color: 'text-green-400' },
  client:  { label: 'Cliente',   icon: Users,           color: 'text-orange-400' },
  content: { label: 'Contenido', icon: Calendar,        color: 'text-pink-400' },
  process: { label: 'Proceso',   icon: GitBranchPlus,   color: 'text-purple-400' },
  prompt:  { label: 'Prompt',    icon: Sparkles,        color: 'text-yellow-400' },
}

const QUICK_NAV = [
  { label: 'Dashboard',    href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Tareas',       href: '/tasks',       icon: CheckSquare },
  { label: 'Clientes',     href: '/clients',     icon: Users },
  { label: 'Contenido',    href: '/content',     icon: Calendar },
  { label: 'Procesos',     href: '/procesos',    icon: GitBranchPlus },
  { label: 'Prompts',      href: '/prompts',     icon: Sparkles },
  { label: 'Credenciales', href: '/credentials', icon: Key },
  { label: 'Ajustes',      href: '/settings',    icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: Props) {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const router = useRouter()
  const [query, setQuery] = useState('')

  // Debounce input
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebounced(query), 180)
    return () => clearTimeout(h)
  }, [query])

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['global-search', workspace?.id, debounced],
    queryFn: () => searchWorkspace(workspace!.id, debounced),
    enabled: !!workspace && debounced.length >= 2,
    staleTime: 30_000,
  })

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setDebounced('')
    }
  }, [open])

  // Group results by type
  const grouped = useMemo(() => {
    const map = new Map<SearchResultType, SearchResult[]>()
    for (const r of results) {
      if (!map.has(r.type)) map.set(r.type, [])
      map.get(r.type)!.push(r)
    }
    return Array.from(map.entries())
  }, [results])

  function go(url: string) {
    router.push(url)
    onOpenChange(false)
  }

  const showEmpty = debounced.length >= 2 && !isFetching && results.length === 0
  const showNav = debounced.length < 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden" showCloseButton={false}>
        <DialogTitle className="sr-only">Buscar en el workspace</DialogTitle>
        <Command shouldFilter={false} className="bg-background">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-4 h-12">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar páginas, tareas, clientes, contenido, procesos..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-[60vh] overflow-auto p-2">
            {showNav && (
              <>
                <Command.Group
                  heading="Navegar"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {QUICK_NAV.map((item) => (
                    <Command.Item
                      key={item.href}
                      value={`nav-${item.label}`}
                      onSelect={() => go(item.href)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 opacity-0 [[aria-selected=true]_&]:opacity-100" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group
                  heading="Consejo"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    Escribe al menos 2 letras para buscar en todo el workspace (páginas, tareas, clientes, contenido, procesos, prompts).
                  </div>
                </Command.Group>
              </>
            )}

            {showEmpty && (
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                Sin resultados para <span className="font-medium">{debounced}</span>
              </Command.Empty>
            )}

            {grouped.map(([type, items]) => {
              const meta = TYPE_META[type]
              return (
                <Command.Group
                  key={type}
                  heading={meta.label + (items.length > 1 ? 's' : '')}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {items.map((r) => (
                    <Command.Item
                      key={`${r.type}-${r.id}`}
                      value={`${r.type}-${r.id}-${r.title}`}
                      onSelect={() => go(r.url)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      {r.icon ? (
                        <span className="text-base shrink-0 w-4 text-center">{r.icon}</span>
                      ) : (
                        <meta.icon className={cn('h-4 w-4 shrink-0', meta.color)} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{r.title}</div>
                        {r.subtitle && (
                          <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                            <Hash className="h-2.5 w-2.5" />
                            {r.subtitle}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 opacity-0 [[aria-selected=true]_&]:opacity-100 shrink-0" />
                    </Command.Item>
                  ))}
                </Command.Group>
              )
            })}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-muted font-mono">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-muted font-mono">↵</kbd>
                abrir
              </span>
            </div>
            <span>
              <kbd className="px-1 rounded bg-muted font-mono">⌘K</kbd> en cualquier momento
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
