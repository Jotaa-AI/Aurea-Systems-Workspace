import { Topbar } from '@/components/layout/topbar'

export default function KnowledgePage() {
  return (
    <>
      <Topbar title="Base de conocimiento" />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Base de conocimiento</h1>
        <p className="text-muted-foreground">
          Base de conocimiento — se construira con paginas en la Fase 1.
        </p>
      </div>
    </>
  )
}
