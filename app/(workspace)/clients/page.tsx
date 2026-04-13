'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchClients, createClient, deleteClient } from './actions'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Trash2, Users, Loader2, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/database'

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  active: { label: 'Activo', style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  onboarding: { label: 'Onboarding', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  paused: { label: 'Pausado', style: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  churned: { label: 'Churned', style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
}

export default function ClientsPage() {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [newMrr, setNewMrr] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', workspace?.id],
    queryFn: () => fetchClients(workspace!.id),
    enabled: !!workspace,
  })

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalMrr = clients
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.mrr), 0)

  async function handleCreate() {
    if (!workspace || !newName.trim()) return
    try {
      const client = await createClient(workspace.id, {
        name: newName.trim(),
        mrr: newMrr ? parseFloat(newMrr) : 0,
      })
      toast.success('Cliente creado')
      setNewName('')
      setNewMrr('')
      setDialogOpen(false)
      router.push(`/clients/${client.id}`)
    } catch {
      toast.error('Error creando cliente')
    }
  }

  async function handleDelete(e: React.MouseEvent, clientId: string) {
    e.stopPropagation()
    try {
      await deleteClient(clientId)
      toast.success('Cliente eliminado')
    } catch {
      toast.error('Error eliminando cliente')
    }
  }

  return (
    <>
      <Topbar title="Clientes" />
      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Header + Stats */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Portfolio de clientes</h1>
            <p className="text-sm text-muted-foreground">
              {clients.filter((c) => c.status === 'active').length} activos · MRR total: {totalMrr.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre de la clinica"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">MRR (EUR)</label>
                  <Input
                    type="number"
                    value={newMrr}
                    onChange={(e) => setNewMrr(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!newName.trim()}>
                  Crear cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {search ? 'Sin resultados' : 'No hay clientes todavia'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-24">Estado</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground w-24">MRR</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground w-20">Salud</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const statusCfg = STATUS_CONFIG[client.status]
                  return (
                    <tr
                      key={client.id}
                      className="border-b last:border-0 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-sm">{client.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn('text-[10px]', statusCfg.style)}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {Number(client.mrr).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Heart className={cn(
                            'h-3.5 w-3.5',
                            client.health_score >= 70 ? 'text-green-500' :
                            client.health_score >= 40 ? 'text-yellow-500' : 'text-red-500'
                          )} />
                          <span className="text-xs tabular-nums">{client.health_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleDelete(e as any, client.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
