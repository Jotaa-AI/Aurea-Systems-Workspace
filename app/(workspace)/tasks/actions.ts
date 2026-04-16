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

export type WorkspaceUser = {
  id: string
  email: string
}

export async function fetchWorkspaceUsers(workspaceId: string): Promise<WorkspaceUser[]> {
  const supabase = await createServiceClient()

  // Get workspace members
  const { data: members } = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)

  if (!members || members.length === 0) {
    // Fallback: get users from Supabase auth (via service client)
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const allowedEmails = (process.env.ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
    return users
      .filter(u => u.email && allowedEmails.includes(u.email.toLowerCase()))
      .map(u => ({ id: u.id, email: u.email! }))
  }

  // Get user details for each member
  const users: WorkspaceUser[] = []
  for (const member of members) {
    const { data: { user } } = await supabase.auth.admin.getUserById(member.user_id)
    if (user?.email) {
      users.push({ id: user.id, email: user.email })
    }
  }
  return users
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
