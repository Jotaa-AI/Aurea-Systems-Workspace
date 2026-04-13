'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Task, TaskBoard } from '@/types/database'

export async function getOrCreateBoard(workspaceId: string): Promise<TaskBoard> {
  const supabase = await createServiceClient()

  const { data: existing } = await supabase
    .from('task_boards')
    .select('*')
    .eq('workspace_id', workspaceId)
    .limit(1)
    .single()

  if (existing) return existing as TaskBoard

  const { data: created, error } = await supabase
    .from('task_boards')
    .insert({ workspace_id: workspaceId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return created as TaskBoard
}

export async function fetchTasks(boardId: string): Promise<Task[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('order_index', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Task[]
}

export async function createTask(
  workspaceId: string,
  boardId: string,
  status: string,
  orderIndex: number
): Promise<Task> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      board_id: boardId,
      title: 'Nueva tarea',
      status,
      order_index: orderIndex,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  return data as Task
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'order_index' | 'assignee_id' | 'client_id' | 'page_id'>>
): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
}

export async function reorderTasks(
  updates: { id: string; status: string; order_index: number }[]
): Promise<void> {
  const supabase = await createServiceClient()

  // Update each task's status and order
  for (const update of updates) {
    await supabase
      .from('tasks')
      .update({ status: update.status, order_index: update.order_index })
      .eq('id', update.id)
  }

  revalidatePath('/tasks')
}
