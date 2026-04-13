import { Topbar } from '@/components/layout/topbar'

export default function ClientsPage() {
  return (
    <>
      <Topbar title="Clientes" />
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Clientes</h1>
        <p className="text-muted-foreground">
          La gestion de clientes GHL llegara en la Fase 3.
        </p>
      </div>
    </>
  )
}
