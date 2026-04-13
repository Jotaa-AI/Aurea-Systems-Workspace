import { Topbar } from '@/components/layout/topbar'

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Bienvenido a Aurea Systems
        </h1>
        <p className="text-muted-foreground mb-10">
          Tu command center esta listo. Los widgets apareceran en la Fase 9.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Paginas', desc: 'Wiki y documentacion', href: '/pages' },
            { title: 'Tareas', desc: 'Kanban de tareas', href: '/tasks' },
            { title: 'Clientes', desc: 'Portfolio GHL', href: '/clients' },
            { title: 'Contenido', desc: 'Estrategia RRSS', href: '/content' },
            { title: 'Prompts', desc: 'Biblioteca de prompts', href: '/prompts' },
            { title: 'Credenciales', desc: 'Boveda segura', href: '/credentials' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-lg border p-5 transition-colors hover:bg-accent"
            >
              <h3 className="font-medium mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
