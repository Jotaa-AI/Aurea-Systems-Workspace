'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchPrompts, createPrompt, deletePrompt } from './actions'
import { PromptDetailPanel } from './prompt-detail-panel'
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
  Sparkles,
  Copy,
  Trash2,
  MoreHorizontal,
  Loader2,
  ChevronDown,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prompt } from '@/types/database'

const DEFAULT_CATEGORIES = ['general', 'ventas', 'ads', 'email', 'chatbot', 'onboarding', 'soporte']

export default function PromptsPage() {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('general')

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['prompts', workspace?.id],
    queryFn: () => fetchPrompts(workspace!.id),
    enabled: !!workspace,
  })

  const categories = useMemo(() => {
    const fromData = prompts.map((p) => p.category)
    return [...new Set([...DEFAULT_CATEGORIES, ...fromData])]
  }, [prompts])

  const filtered = useMemo(() => {
    let result = prompts
    if (filterCategory) result = result.filter((p) => p.category === filterCategory)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [prompts, search, filterCategory])

  async function handleCreate() {
    if (!workspace || !newTitle.trim()) return
    try {
      const prompt = await createPrompt(workspace.id, {
        title: newTitle.trim(),
        content: newContent,
        category: newCategory,
      })
      queryClient.invalidateQueries({ queryKey: ['prompts', workspace.id] })
      toast.success('Prompt creado')
      setNewTitle('')
      setNewContent('')
      setNewCategory('general')
      setDialogOpen(false)
      setSelectedPrompt(prompt)
    } catch {
      toast.error('Error creando prompt')
    }
  }

  async function handleCopy(content: string) {
    await navigator.clipboard.writeText(content)
    toast.success('Copiado al clipboard')
  }

  async function handleDelete(e: React.MouseEvent, promptId: string) {
    e.stopPropagation()
    try {
      await deletePrompt(promptId)
      queryClient.invalidateQueries({ queryKey: ['prompts', workspace?.id] })
      if (selectedPrompt?.id === promptId) setSelectedPrompt(null)
      toast.success('Prompt eliminado')
    } catch {
      toast.error('Error eliminando')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Prompts" />

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de prompts</h1>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  Nuevo prompt
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nuevo prompt</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titulo</label>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Nombre del prompt"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoria</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm w-full justify-between hover:bg-accent transition-colors">
                          {newCategory}
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <DropdownMenuItem key={cat} onClick={() => setNewCategory(cat)}>
                              {cat}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Contenido <span className="text-muted-foreground font-normal">(usa {'{{variable}}'} para parametros)</span>
                      </label>
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Escribe tu prompt aqui..."
                        rows={6}
                        className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreate} disabled={!newTitle.trim()}>Crear</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search + filters */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar prompts..."
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0">
                  <Tag className="h-3.5 w-3.5" />
                  {filterCategory ?? 'Categoria'}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCategory(null)}>Todas</DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Prompts list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {search || filterCategory ? 'Sin resultados' : 'No hay prompts todavia'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="group flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{prompt.title}</span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{prompt.category}</Badge>
                        <span className="text-[10px] text-muted-foreground shrink-0">v{prompt.version}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-mono">{prompt.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {prompt.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                        ))}
                        {prompt.variables.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {prompt.variables.length} variable{prompt.variables.length > 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); handleCopy(prompt.content) }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, prompt.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedPrompt && (
          <PromptDetailPanel
            prompt={selectedPrompt}
            onClose={() => setSelectedPrompt(null)}
            onUpdated={(p) => {
              setSelectedPrompt(p)
              queryClient.invalidateQueries({ queryKey: ['prompts', workspace?.id] })
            }}
          />
        )}
      </div>
    </div>
  )
}
