'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import { TaskDetailPanel } from './task-detail-panel'
import { useCreateTask, useReorderTasks } from '@/lib/hooks/use-tasks'
import type { Task, TaskBoard } from '@/types/database'

export function KanbanBoard({
  board,
  tasks: initialTasks,
}: {
  board: TaskBoard
  tasks: Task[]
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const createTaskMutation = useCreateTask()
  const reorderMutation = useReorderTasks()

  // Keep tasks in sync with prop changes
  useMemo(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const col of board.columns) {
      map[col.id] = tasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => a.order_index - b.order_index)
    }
    return map
  }, [tasks, board.columns])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskItem = tasks.find((t) => t.id === activeId)
    if (!activeTaskItem) return

    // Determine target column
    const overTask = tasks.find((t) => t.id === overId)
    const targetColumn = overTask ? overTask.status : overId

    // If column changed, move the task
    if (activeTaskItem.status !== targetColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: targetColumn } : t
        )
      )
    }
  }, [tasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Build the new order for affected columns
    const updatedTasks = [...tasks]
    const activeTask = updatedTasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Get tasks in the target column
    const targetColumn = activeTask.status
    const columnTasks = updatedTasks
      .filter((t) => t.status === targetColumn && t.id !== activeId)
      .sort((a, b) => a.order_index - b.order_index)

    // Find insert position
    const overIndex = columnTasks.findIndex((t) => t.id === overId)
    if (overId === targetColumn || overIndex === -1) {
      // Dropped on column itself or at end
      columnTasks.push(activeTask)
    } else {
      columnTasks.splice(overIndex, 0, activeTask)
    }

    // Assign new order indices
    const updates = columnTasks.map((t, i) => ({
      id: t.id,
      status: targetColumn,
      order_index: i,
    }))

    // Optimistic update
    setTasks((prev) => {
      const result = prev.map((t) => {
        const update = updates.find((u) => u.id === t.id)
        if (update) return { ...t, status: update.status, order_index: update.order_index }
        return t
      })
      return result
    })

    reorderMutation.mutate({ updates, boardId: board.id })
  }, [tasks, board.id, reorderMutation])

  const handleAddTask = useCallback(
    async (columnId: string) => {
      const columnTasks = tasksByColumn[columnId] ?? []
      const maxOrder = columnTasks.length > 0
        ? Math.max(...columnTasks.map((t) => t.order_index))
        : -1

      const newTask = await createTaskMutation.mutateAsync({
        boardId: board.id,
        status: columnId,
        orderIndex: maxOrder + 1,
      })

      setTasks((prev) => [...prev, newTask])
      setSelectedTask(newTask)
    },
    [board.id, tasksByColumn, createTaskMutation]
  )

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 h-full min-w-max">
            {board.columns.map((column) => (
              <SortableContext
                key={column.id}
                items={(tasksByColumn[column.id] ?? []).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  column={column}
                  tasks={tasksByColumn[column.id] ?? []}
                  onAddTask={() => handleAddTask(column.id)}
                  onSelectTask={setSelectedTask}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          boardId={board.id}
          columns={board.columns}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            )
            setSelectedTask(updated)
          }}
          onDelete={(taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId))
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}
