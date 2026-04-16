'use client'

import type { Process } from '@/types/database'
import { getCategoryConfig, PROCESS_STATUS_CONFIG } from '@/lib/process-config'
import { Badge } from '@/components/ui/badge'
import { Clock, Layers, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

type Props = {
  processes: Process[]
  onSelect: (process: Process) => void
}

export function ProcessList({ processes, onSelect }: Props) {
  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-1">Sin procesos</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Crea tu primer SOP para documentar los procesos internos de tu agencia usando la metodología BPMN.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {processes.map((process) => {
        const cat = getCategoryConfig(process.category)
        const status = PROCESS_STATUS_CONFIG[process.status]
        const stepsCount = process.steps?.length ?? 0
        const totalMinutes = process.estimated_duration_minutes ??
          (process.steps ?? []).reduce((acc, s) => acc + (s.estimated_minutes ?? 0), 0)

        return (
          <button
            key={process.id}
            className="flex items-start gap-4 rounded-lg border p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm group"
            onClick={() => onSelect(process)}
          >
            {/* Icon */}
            <div className="text-2xl shrink-0 mt-0.5">{process.icon ?? cat.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {process.title}
                </h3>
                <Badge variant="secondary" className={cn('text-[10px] shrink-0', status.style)}>
                  {status.label}
                </Badge>
              </div>

              {process.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {process.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className={cn('h-2 w-2 rounded-full', cat.color)} />
                  {cat.label}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {stepsCount} paso{stepsCount !== 1 ? 's' : ''}
                </span>
                {totalMinutes > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {totalMinutes >= 60
                      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                      : `${totalMinutes}m`}
                  </span>
                )}
                {process.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {process.tags.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="text-[10px] text-muted-foreground shrink-0 text-right">
              <span>v{process.version}</span>
              <br />
              <span>
                {formatDistanceToNow(new Date(process.updated_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
