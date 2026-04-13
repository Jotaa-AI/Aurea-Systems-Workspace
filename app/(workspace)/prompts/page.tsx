import { Topbar } from '@/components/layout/topbar'

export default function PromptsPage() {
  return (
    <>
      <Topbar title="Prompts" />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Prompts</h1>
        <p className="text-muted-foreground">
          La biblioteca de prompts llegara en la Fase 4.
        </p>
      </div>
    </>
  )
}
