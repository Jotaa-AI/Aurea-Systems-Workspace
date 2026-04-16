import { ProcessClient } from './process-client'

export default async function ProcessPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <ProcessClient processId={id} />
}
