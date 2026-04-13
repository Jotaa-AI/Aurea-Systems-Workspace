import { Topbar } from '@/components/layout/topbar'

export default function CredentialsPage() {
  return (
    <>
      <Topbar title="Credenciales" />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Credenciales</h1>
        <p className="text-muted-foreground">
          La boveda de credenciales cifradas llegara en la Fase 5.
        </p>
      </div>
    </>
  )
}
