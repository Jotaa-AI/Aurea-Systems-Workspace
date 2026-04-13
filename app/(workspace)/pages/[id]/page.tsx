import { Topbar } from '@/components/layout/topbar'

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <>
      <Topbar />
      <div className="mx-auto max-w-3xl px-8 py-10">
        <p className="text-muted-foreground">
          Editor de pagina ({id}) — Fase 1.
        </p>
      </div>
    </>
  )
}
