import { Topbar } from '@/components/layout/topbar'

export default function TasksPage() {
  return (
    <>
      <Topbar title="Tareas" />
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Tareas</h1>
        <p className="text-muted-foreground">
          El Kanban con dnd-kit llegara en la Fase 2.
        </p>
      </div>
    </>
  )
}
