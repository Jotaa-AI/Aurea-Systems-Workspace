import { Topbar } from '@/components/layout/topbar'

export default function PagesIndex() {
  return (
    <>
      <Topbar title="Paginas" />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Paginas</h1>
        <p className="text-muted-foreground">
          El editor de paginas con BlockNote llegara en la Fase 1.
        </p>
      </div>
    </>
  )
}
