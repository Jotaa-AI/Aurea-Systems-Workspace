'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, ChevronDown, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task, TaskBoard } from '@/types/database'

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export function TaskListView({
  board,
  tasks,
  onSelectTask,
}: {
  board: TaskBoard
  tasks: Task[]
  onSelectTask: (task: Task) => void
}) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const filteredTasks = useMemo(() => {
    let result = tasks
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority)
    if (filterStatus) result = result.filter((t) => t.status === filterStatus)
    return result.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    })
  }, [tasks, filterPriority, filterStatus])

  const columnMap = Object.fromEntries(board.columns.map((c) => [c.id, c.title]))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs hover:bg-accent transition-colors">
            {filterStatus ? columnMap[filterStatus] : 'Estado'}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              Todos
            </DropdownMenuItem>
            {board.columns.map((col) => (
              <DropdownMenuItem key={col.id} onClick={() => setFilterStatus(col.id)}>
                {col.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs hover:bg-accent transition-colors">
            {filterPriority ? PRIORITY_LABELS[filterPriority] : 'Prioridad'}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority(null)}>
              Todas
            </DropdownMenuItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <DropdownMenuItem key={value} onClick={() => setFilterPriority(value)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(filterStatus || filterPriority) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => { setFilterStatus(null); setFilterPriority(null) }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Tarea</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-28">Estado</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-24">Prioridad</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-28">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectTask(task)}
              >
                <td className="px-4 py-2.5 text-sm">{task.title}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    {columnMap[task.status] ?? task.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant="secondary" className={cn('text-[10px]', PRIORITY_STYLES[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                </td>
                <td className="px-4 py-2.5">
                  {task.due_date ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), 'dd MMM')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay tareas{filterStatus || filterPriority ? ' con estos filtros' : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
