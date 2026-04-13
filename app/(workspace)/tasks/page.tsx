'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel'
import { useTaskBoard, useTasks } from '@/lib/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Kanban, List, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { data: board, isLoading: boardLoading } = useTaskBoard()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(board?.id)

  const isLoading = boardLoading || tasksLoading

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Tareas" />

      {/* View toggle */}
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <div className="flex items-center rounded-lg border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2.5 text-xs', view === 'kanban' && 'bg-accent')}
            onClick={() => setView('kanban')}
          >
            <Kanban className="mr-1.5 h-3.5 w-3.5" />
            Kanban
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2.5 text-xs', view === 'list' && 'bg-accent')}
            onClick={() => setView('list')}
          >
            <List className="mr-1.5 h-3.5 w-3.5" />
            Lista
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !board ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Error cargando el board
        </div>
      ) : view === 'kanban' ? (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard board={board} tasks={tasks} />
        </div>
      ) : (
        <div className="flex flex-1">
          <div className="flex-1 p-6">
            <TaskListView
              board={board}
              tasks={tasks}
              onSelectTask={setSelectedTask}
            />
          </div>
          {selectedTask && (
            <TaskDetailPanel
              task={selectedTask}
              boardId={board.id}
              columns={board.columns}
              onClose={() => setSelectedTask(null)}
              onUpdate={(updated) => setSelectedTask(updated)}
              onDelete={() => setSelectedTask(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
