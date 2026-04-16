'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchProcess, updateProcess, deleteProcess, duplicateProcess } from '../actions'
import { BPMNFlow } from '@/components/procesos/bpmn-flow'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Save,
  Loader2,
  MoreHorizontal,
  Copy,
  Trash2,
  Clock,
  Layers,
  Tag,
  X,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  PROCESS_CATEGORIES,
  PROCESS_STATUS_CONFIG,
  getCategoryConfig,
  STEP_TYPES,
  createDefaultStep,
} from '@/lib/process-config'
import type { Process, ProcessCategory, ProcessStatus, ProcessStep } from '@/types/database'

type Props = {
  processId: string
}

export function ProcessClient({ processId }: Props) {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: process, isLoading } = useQuery({
    queryKey: ['process', processId],
    queryFn: () => fetchProcess(processId),
  })

  // Local form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ProcessCategory>('general')
  const [status, setStatus] = useState<ProcessStatus>('draft')
  const [icon, setIcon] = useState('📋')
  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Sync fetched data to form state
  useEffect(() => {
    if (process && !initialized) {
      setTitle(process.title)
      setDescription(process.description ?? '')
      setCategory(process.category)
      setStatus(process.status)
      setIcon(process.icon ?? '📋')
      setSteps(process.steps ?? [])
      setTags(process.tags ?? [])
      setInitialized(true)
    }
  }, [process, initialized])

  // Auto-save debounce
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSave = useCallback(
    (updates: Partial<Process>) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(async () => {
        try {
          await updateProcess(processId, updates)
        } catch {
          // silent - manual save as fallback
        }
      }, 2000)
    },
    [processId]
  )

  function handleStepsChange(newSteps: ProcessStep[]) {
    setSteps(newSteps)
    autoSave({ steps: newSteps })
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Calculate total estimated duration from steps
      const totalMinutes = steps.reduce((acc, s) => acc + (s.estimated_minutes ?? 0), 0)

      await updateProcess(processId, {
        title,
        description,
        category,
        status,
        icon,
        steps,
        tags,
        estimated_duration_minutes: totalMinutes || null,
      })
      queryClient.invalidateQueries({ queryKey: ['process', processId] })
      queryClient.invalidateQueries({ queryKey: ['processes', workspace?.id] })
      toast.success('Proceso guardado')
    } catch {
      toast.error('Error guardando')
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicate() {
    try {
      const dup = await duplicateProcess(processId)
      queryClient.invalidateQueries({ queryKey: ['processes', workspace?.id] })
      toast.success('Proceso duplicado')
      router.push(`/procesos/${dup.id}`)
    } catch {
      toast.error('Error duplicando')
    }
  }

  async function handleDelete() {
    try {
      await deleteProcess(processId)
      queryClient.invalidateQueries({ queryKey: ['processes', workspace?.id] })
      toast.success('Proceso eliminado')
      router.push('/procesos')
    } catch {
      toast.error('Error eliminando')
    }
  }

  function addTag() {
    const t = newTag.trim()
    if (t && !tags.includes(t)) {
      const next = [...tags, t]
      setTags(next)
      setNewTag('')
      autoSave({ tags: next })
    }
  }

  if (isLoading || !process) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const catCfg = getCategoryConfig(category)
  const statusCfg = PROCESS_STATUS_CONFIG[status]
  const totalMinutes = steps.reduce((acc, s) => acc + (s.estimated_minutes ?? 0), 0)

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Procesos" />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-6">
          {/* Navigation */}
          <button
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            onClick={() => router.push('/procesos')}
          >
            <ArrowLeft className="h-4 w-4" />
            Todos los procesos
          </button>

          {/* Title + actions */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl cursor-default">{icon}</span>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    autoSave({ title: e.target.value })
                  }}
                  className="text-2xl font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 shadow-none"
                  placeholder="Nombre del proceso..."
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  autoSave({ description: e.target.value })
                }}
                placeholder="Describe este proceso..."
                rows={2}
                className="w-full text-sm text-muted-foreground bg-transparent border-0 p-0 resize-none focus:outline-none placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md border p-2 hover:bg-accent transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar proceso
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Category */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                <div className={cn('h-2.5 w-2.5 rounded-full', catCfg.color)} />
                {catCfg.label}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PROCESS_CATEGORIES.map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => {
                      setCategory(c.value)
                      autoSave({ category: c.value })
                    }}
                  >
                    <span className="mr-2">{c.icon}</span>
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Badge variant="secondary" className={cn('text-[10px] cursor-pointer', statusCfg.style)}>
                  {statusCfg.label}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.entries(PROCESS_STATUS_CONFIG) as [ProcessStatus, { label: string; style: string }][]).map(
                  ([val, cfg]) => (
                    <DropdownMenuItem
                      key={val}
                      onClick={() => {
                        setStatus(val)
                        autoSave({ status: val })
                      }}
                    >
                      <Badge variant="secondary" className={cn('text-[10px]', cfg.style)}>
                        {cfg.label}
                      </Badge>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2">
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {steps.length} pasos
              </span>
              {totalMinutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {totalMinutes >= 60
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : `${totalMinutes}m`}
                </span>
              )}
              <span className="text-[10px]">v{process.version}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] gap-1 pr-1">
                {tag}
                <button
                  className="hover:bg-foreground/10 rounded-full p-0.5"
                  onClick={() => {
                    const next = tags.filter((t) => t !== tag)
                    setTags(next)
                    autoSave({ tags: next })
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Agregar etiqueta..."
                className="h-6 text-xs w-32 border-dashed"
              />
              {newTag && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={addTag}>
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* BPMN flow section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Flujo del proceso (BPMN)</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mapea cada paso: define responsables, entradas, salidas y herramientas.
                </p>
              </div>
              {steps.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                    <Plus className="h-3 w-3" />
                    Agregar paso
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {STEP_TYPES.map((st) => (
                      <DropdownMenuItem
                        key={st.value}
                        onClick={() => {
                          const newStep = createDefaultStep(st.value)
                          handleStepsChange([...steps, newStep])
                        }}
                      >
                        <span className="mr-2">{st.icon}</span>
                        {st.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <BPMNFlow steps={steps} onChange={handleStepsChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
