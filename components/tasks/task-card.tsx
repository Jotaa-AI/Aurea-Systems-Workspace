'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

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

export function TaskCard({
  task,
  onClick,
  isOverlay,
}: {
  task: Task
  onClick?: () => void
  isOverlay?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm cursor-pointer transition-shadow hover:shadow-md',
        isDragging && 'opacity-50',
        isOverlay && 'shadow-lg rotate-2'
      )}
    >
      <p className="text-sm font-medium mb-2 line-clamp-2">{task.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className={cn('text-[10px] px-1.5 py-0', PRIORITY_STYLES[task.priority])}
        >
          {PRIORITY_LABELS[task.priority]}
        </Badge>

        {task.due_date && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), 'dd MMM')}
          </span>
        )}
      </div>
    </div>
  )
}
