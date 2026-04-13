import { Topbar } from '@/components/layout/topbar'

export default function ContentPage() {
  return (
    <>
      <Topbar title="Contenido" />
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Contenido</h1>
        <p className="text-muted-foreground">
          La estrategia de contenidos RRSS llegara en la Fase 6.
        </p>
      </div>
    </>
  )
}
