'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchClient, updateClient, deleteClient, fetchClientMetrics, fetchClientTasks } from '../actions'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Heart,
  ChevronDown,
  Trash2,
  Loader2,
  CheckSquare,
  BarChart3,
  Calendar,
  Users,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Client, Task } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'paused', label: 'Pausado' },
  { value: 'churned', label: 'Churned' },
] as const

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  onboarding: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  churned: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export function ClientDetailView({ clientId }: { clientId: string }) {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClient(clientId),
  })

  const { data: metrics = [] } = useQuery({
    queryKey: ['client-metrics', clientId],
    queryFn: () => fetchClientMetrics(clientId),
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['client-tasks', clientId],
    queryFn: () => fetchClientTasks(clientId),
  })

  const [notes, setNotes] = useState<string | undefined>(undefined)

  const saveField = useCallback(
    async (field: string, value: unknown) => {
      try {
        await updateClient(clientId, { [field]: value })
      } catch {
        toast.error('Error guardando')
      }
    },
    [clientId]
  )

  const debouncedSave = useCallback(
    (field: string, value: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => saveField(field, value), 800)
    },
    [saveField]
  )

  const handleDelete = useCallback(async () => {
    try {
      await deleteClient(clientId)
      toast.success('Cliente eliminado')
      router.push('/clients')
    } catch {
      toast.error('Error eliminando')
    }
  }, [clientId, router])

  if (isLoading || !client) {
    return (
      <>
        <Topbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  const totalLeads = metrics.reduce((s, m) => s + m.leads_count, 0)
  const totalAppointments = metrics.reduce((s, m) => s + m.appointments_count, 0)
  const totalNoShows = metrics.reduce((s, m) => s + m.no_show_count, 0)
  const totalRevenue = metrics.reduce((s, m) => s + Number(m.revenue_generated), 0)

  return (
    <>
      <Topbar />
      <div className="mx-auto max-w-4xl px-8 py-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Clientes
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">{client.name}</h1>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5">
                  <Badge variant="secondary" className={cn('text-xs', STATUS_STYLES[client.status])}>
                    {STATUS_OPTIONS.find((s) => s.value === client.status)?.label}
                  </Badge>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STATUS_OPTIONS.map((s) => (
                    <DropdownMenuItem key={s.value} onClick={() => saveField('status', s.value)}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1">
                <Heart className={cn(
                  'h-4 w-4',
                  client.health_score >= 70 ? 'text-green-500' :
                  client.health_score >= 40 ? 'text-yellow-500' : 'text-red-500'
                )} />
                <span className="text-sm font-medium tabular-nums">{client.health_score}/100</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">MRR</p>
            <Input
              type="number"
              defaultValue={client.mrr}
              onChange={(e) => debouncedSave('mrr', parseFloat(e.target.value) || 0)}
              className="w-32 text-right font-semibold tabular-nums"
            />
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <MetricCard icon={Users} label="Leads" value={totalLeads} />
          <MetricCard icon={Calendar} label="Citas" value={totalAppointments} />
          <MetricCard icon={BarChart3} label="No-shows" value={totalNoShows} alert={totalNoShows > 5} />
          <MetricCard icon={BarChart3} label="Revenue" value={totalRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} />
        </div>

        <Separator className="mb-8" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* GHL Config */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              GoHighLevel
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Location ID</Label>
                <Input
                  defaultValue={client.ghl_location_id ?? ''}
                  onChange={(e) => debouncedSave('ghl_location_id', e.target.value)}
                  placeholder="loc_xxxxx"
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              Tareas asociadas ({tasks.length})
            </h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin tareas</p>
            ) : (
              <div className="space-y-1.5">
                {(tasks as Task[]).slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push('/tasks')}
                  >
                    <span className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-zinc-300'
                    )} />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Notes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Notas</Label>
          <textarea
            value={notes ?? client.notes ?? ''}
            onChange={(e) => {
              setNotes(e.target.value)
              debouncedSave('notes', e.target.value)
            }}
            placeholder="Notas sobre el cliente..."
            className="flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>
    </>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  alert?: boolean
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', alert ? 'text-red-500' : 'text-muted-foreground')} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-xl font-semibold tabular-nums', alert && 'text-red-500')}>
        {value}
      </p>
    </div>
  )
}
