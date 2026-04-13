'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Client, ClientMetric } from '@/types/database'

export async function fetchClients(workspaceId: string): Promise<Client[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Client[]
}

export async function fetchClient(clientId: string): Promise<Client> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

export async function createClient(
  workspaceId: string,
  input: { name: string; ghl_location_id?: string; mrr?: number; status?: Client['status'] }
): Promise<Client> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      ghl_location_id: input.ghl_location_id ?? null,
      mrr: input.mrr ?? 0,
      status: input.status ?? 'onboarding',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/clients')
  return data as Client
}

export async function updateClient(
  clientId: string,
  updates: Partial<Pick<Client, 'name' | 'ghl_location_id' | 'ghl_api_key_encrypted' | 'status' | 'mrr' | 'notes' | 'health_score'>>
): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)

  if (error) throw new Error(error.message)
  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
}

export async function deleteClient(clientId: string): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw new Error(error.message)
  revalidatePath('/clients')
}

export async function fetchClientMetrics(
  clientId: string,
  limit = 30
): Promise<ClientMetric[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('client_metrics')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data as ClientMetric[]
}

export async function fetchClientTasks(clientId: string) {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return data
}
