'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import {
  getOrCreateBoard,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '@/app/(workspace)/tasks/actions'
import type { Task, TaskBoard } from '@/types/database'

export function useTaskBoard() {
  const workspace = useWorkspaceStore((s) => s.workspace)

  return useQuery({
    queryKey: ['task-board', workspace?.id],
    queryFn: () => getOrCreateBoard(workspace!.id),
    enabled: !!workspace,
  })
}

export function useTasks(boardId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => fetchTasks(boardId!),
    enabled: !!boardId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const workspace = useWorkspaceStore((s) => s.workspace)

  return useMutation({
    mutationFn: ({
      boardId,
      status,
      orderIndex,
    }: {
      boardId: string
      status: string
      orderIndex: number
    }) => createTask(workspace!.id, boardId, status, orderIndex),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      updates,
      boardId,
    }: {
      taskId: string
      updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'order_index'>>
      boardId: string
    }) => updateTask(taskId, updates),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; boardId: string }) =>
      deleteTask(taskId),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] })
    },
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      updates,
    }: {
      updates: { id: string; status: string; order_index: number }[]
      boardId: string
    }) => reorderTasks(updates),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] })
    },
  })
}
