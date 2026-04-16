'use client'

import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { updateTask, deleteTask, fetchWorkspaceUsers } from '@/app/(workspace)/tasks/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { X, Trash2, ChevronDown, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

const PRIORITIES = [
  { value: 'low', label: 'Baja', style: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  { value: 'medium', label: 'Media', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  { value: 'high', label: 'Alta', style: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  { value: 'urgent', label: 'Urgente', style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
] as const

export function TaskDetailPanel({
  task,
  boardId,
  columns,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task
  boardId: string
  columns: { id: string; title: string }[]
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: users = [] } = useQuery({
    queryKey: ['workspace-users', workspace?.id],
    queryFn: () => fetchWorkspaceUsers(workspace!.id),
    enabled: !!workspace,
  })

  const assignedUser = users.find((u) => u.id === task.assignee_id)

  const saveField = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateTask(task.id, { [field]: value })
        onUpdate({ ...task, [field]: value } as Task)
      } catch {
        toast.error('Error guardando cambio')
      }
    },
    [task, onUpdate]
  )

  const debouncedSave = useCallback(
    (field: string, value: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => saveField(field, value), 600)
    },
    [saveField]
  )

  const handleDelete = useCallback(async () => {
    try {
      await deleteTask(task.id)
      onDelete(task.id)
      toast.success('Tarea eliminada')
    } catch {
      toast.error('Error eliminando tarea')
    }
  }, [task.id, onDelete])

  const currentPriority = PRIORITIES.find((p) => p.value === task.priority) ?? PRIORITIES[1]
  const currentColumn = columns.find((c) => c.id === task.status)

  return (
    <div className="w-96 shrink-0 border-l bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-medium text-muted-foreground">Detalle</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Title */}
        <div>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              debouncedSave('title', e.target.value)
            }}
            className="text-lg font-semibold border-none px-0 focus-visible:ring-0 shadow-none"
            placeholder="Titulo de la tarea"
          />
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm w-full justify-between hover:bg-accent transition-colors">
              {currentColumn?.title ?? task.status}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {columns.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => saveField('status', col.id)}
                >
                  {col.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Prioridad</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm w-full justify-between hover:bg-accent transition-colors">
              <Badge variant="secondary" className={cn('text-xs', currentPriority.style)}>
                {currentPriority.label}
              </Badge>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {PRIORITIES.map((p) => (
                <DropdownMenuItem
                  key={p.value}
                  onClick={() => saveField('priority', p.value)}
                >
                  <Badge variant="secondary" className={cn('text-xs', p.style)}>
                    {p.label}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Fecha limite</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              saveField('due_date', e.target.value || null)
            }}
          />
        </div>

        {/* Assignee */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Responsable</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm w-full justify-between hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {assignedUser ? (
                  <span>{assignedUser.email.split('@')[0]}</span>
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => saveField('assignee_id', null)}>
                <span className="text-muted-foreground">Sin asignar</span>
              </DropdownMenuItem>
              {users.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => saveField('assignee_id', u.id)}>
                  {u.email.split('@')[0]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Descripcion</Label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              debouncedSave('description', e.target.value)
            }}
            placeholder="Anade una descripcion..."
            className="flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>
    </div>
  )
}
