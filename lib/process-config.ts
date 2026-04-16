import type { ProcessCategory, ProcessStatus, StepType, ProcessStep } from '@/types/database'

// ── Categories ──────────────────────────────────────────

export const PROCESS_CATEGORIES: {
  value: ProcessCategory
  label: string
  icon: string
  color: string
}[] = [
  { value: 'general',      label: 'General',       icon: '📋', color: 'bg-gray-500' },
  { value: 'ventas',       label: 'Ventas',        icon: '💰', color: 'bg-green-500' },
  { value: 'onboarding',   label: 'Onboarding',    icon: '🚀', color: 'bg-blue-500' },
  { value: 'operaciones',  label: 'Operaciones',   icon: '⚙️', color: 'bg-orange-500' },
  { value: 'contenido',    label: 'Contenido',     icon: '📱', color: 'bg-purple-500' },
  { value: 'soporte',      label: 'Soporte',       icon: '🎧', color: 'bg-yellow-500' },
  { value: 'rrhh',         label: 'RRHH',          icon: '👥', color: 'bg-pink-500' },
  { value: 'finanzas',     label: 'Finanzas',      icon: '📊', color: 'bg-emerald-500' },
]

export function getCategoryConfig(category: ProcessCategory) {
  return PROCESS_CATEGORIES.find((c) => c.value === category) ?? PROCESS_CATEGORIES[0]
}

// ── Status ──────────────────────────────────────────────

export const PROCESS_STATUS_CONFIG: Record<ProcessStatus, { label: string; style: string }> = {
  draft:    { label: 'Borrador',   style: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  review:   { label: 'En revisión', style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  active:   { label: 'Activo',     style: 'bg-green-500/15 text-green-400 border-green-500/20' },
  archived: { label: 'Archivado',  style: 'bg-red-500/15 text-red-400 border-red-500/20' },
}

// ── Step types (BPMN-inspired) ──────────────────────────

export const STEP_TYPES: { value: StepType; label: string; icon: string; color: string }[] = [
  { value: 'start',      label: 'Inicio',     icon: '🟢', color: 'border-green-500 bg-green-500/10' },
  { value: 'task',       label: 'Tarea',      icon: '📌', color: 'border-blue-500 bg-blue-500/10' },
  { value: 'decision',   label: 'Decisión',   icon: '🔀', color: 'border-yellow-500 bg-yellow-500/10' },
  { value: 'subprocess', label: 'Subproceso', icon: '📦', color: 'border-purple-500 bg-purple-500/10' },
  { value: 'end',        label: 'Fin',        icon: '🔴', color: 'border-red-500 bg-red-500/10' },
]

export function getStepTypeConfig(type: StepType) {
  return STEP_TYPES.find((s) => s.value === type) ?? STEP_TYPES[1]
}

// ── Default step factory ────────────────────────────────

let stepCounter = 0
export function createDefaultStep(type: StepType = 'task'): ProcessStep {
  stepCounter++
  const defaults: Record<StepType, Partial<ProcessStep>> = {
    start:      { title: 'Inicio del proceso', description: 'Punto de entrada del proceso.' },
    task:       { title: `Paso ${stepCounter}`, description: '' },
    decision:   { title: 'Punto de decisión', description: '', conditions: [{ label: 'Sí', nextStepId: '' }, { label: 'No', nextStepId: '' }] },
    subprocess: { title: 'Subproceso', description: '' },
    end:        { title: 'Fin del proceso', description: 'El proceso ha finalizado.' },
  }
  return {
    id: crypto.randomUUID(),
    type,
    title: defaults[type]?.title ?? '',
    description: defaults[type]?.description ?? '',
    responsible: '',
    inputs: [],
    outputs: [],
    tools: [],
    estimated_minutes: null,
    notes: '',
    ...defaults[type],
  }
}

// ── SOP Templates ───────────────────────────────────────

export type SOPTemplate = {
  title: string
  description: string
  category: ProcessCategory
  icon: string
  steps: ProcessStep[]
  tags: string[]
}

export const SOP_TEMPLATES: SOPTemplate[] = [
  {
    title: 'Onboarding de cliente',
    description: 'Proceso estándar para incorporar un nuevo cliente a la agencia.',
    category: 'onboarding',
    icon: '🚀',
    tags: ['cliente', 'onboarding', 'inicio'],
    steps: [
      { id: crypto.randomUUID(), type: 'start', title: 'Nuevo cliente firmado', description: 'Se ha cerrado el contrato con el cliente.', responsible: 'Ventas', inputs: ['Contrato firmado'], outputs: ['Datos del cliente'], tools: [], estimated_minutes: null, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Crear accesos y espacios', description: 'Crear acceso en las herramientas: GHL, Google Drive, Slack, etc.', responsible: 'Operaciones', inputs: ['Datos del cliente'], outputs: ['Accesos creados'], tools: ['GHL', 'Google Drive', 'Slack'], estimated_minutes: 30, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Reunión de kickoff', description: 'Presentar al equipo, alinear expectativas, definir objetivos y KPIs.', responsible: 'Account Manager', inputs: ['Accesos creados', 'Brief del cliente'], outputs: ['Objetivos definidos', 'Calendario acordado'], tools: ['Google Meet', 'Notion'], estimated_minutes: 60, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Recopilar assets de marca', description: 'Solicitar logos, guía de estilo, accesos a redes sociales, fotos/videos.', responsible: 'Account Manager', inputs: ['Checklist de assets'], outputs: ['Assets organizados'], tools: ['Google Drive'], estimated_minutes: 15, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Configurar herramientas', description: 'Configurar CRM, funnel, automaciones y píxeles según la estrategia del cliente.', responsible: 'Operaciones', inputs: ['Accesos del cliente', 'Estrategia'], outputs: ['Herramientas configuradas'], tools: ['GHL', 'Meta Business', 'Google Ads'], estimated_minutes: 120, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Crear estrategia inicial', description: 'Definir la estrategia de contenido, ads y CRM para los primeros 30 días.', responsible: 'Estrategia', inputs: ['Objetivos', 'Assets de marca'], outputs: ['Plan de acción 30 días'], tools: ['Notion', 'Canva'], estimated_minutes: 90, notes: '' },
      { id: crypto.randomUUID(), type: 'decision', title: '¿Cliente aprueba la estrategia?', description: 'El cliente revisa y aprueba la estrategia propuesta.', responsible: 'Account Manager', inputs: ['Plan de acción'], outputs: ['Aprobación'], tools: [], estimated_minutes: null, notes: '', conditions: [{ label: 'Aprobada', nextStepId: '' }, { label: 'Requiere cambios', nextStepId: '' }] },
      { id: crypto.randomUUID(), type: 'task', title: 'Lanzar primera campaña', description: 'Publicar el primer contenido y activar la primera campaña de ads.', responsible: 'Media Buyer', inputs: ['Estrategia aprobada', 'Assets'], outputs: ['Campaña en vivo'], tools: ['Meta Ads', 'GHL'], estimated_minutes: 60, notes: '' },
      { id: crypto.randomUUID(), type: 'end', title: 'Onboarding completado', description: 'El cliente está operativo y en fase de ejecución.', responsible: '', inputs: [], outputs: [], tools: [], estimated_minutes: null, notes: '' },
    ],
  },
  {
    title: 'Creación de contenido',
    description: 'Proceso para crear, revisar y publicar contenido en redes sociales.',
    category: 'contenido',
    icon: '📱',
    tags: ['contenido', 'redes', 'publicación'],
    steps: [
      { id: crypto.randomUUID(), type: 'start', title: 'Inicio de ciclo de contenido', description: 'Comienza el proceso de creación para el periodo.', responsible: 'Content Manager', inputs: ['Calendario editorial'], outputs: [], tools: [], estimated_minutes: null, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Investigación y brainstorming', description: 'Investigar tendencias, analizar competencia y generar ideas de contenido.', responsible: 'Content Manager', inputs: ['Estrategia de marca', 'Trends'], outputs: ['Ideas aprobadas'], tools: ['Instagram', 'TikTok', 'Google Trends'], estimated_minutes: 45, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Redactar copys y guiones', description: 'Escribir hooks, captions, hashtags y guiones para vídeos.', responsible: 'Copywriter', inputs: ['Ideas aprobadas', 'Identidad de marca'], outputs: ['Copys redactados'], tools: ['Notion', 'ChatGPT'], estimated_minutes: 60, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Crear piezas visuales', description: 'Diseñar carruseles, portadas de reels, stories y gráficos.', responsible: 'Diseñador', inputs: ['Copys', 'Assets de marca'], outputs: ['Piezas diseñadas'], tools: ['Canva', 'Figma', 'Photoshop'], estimated_minutes: 90, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Grabar y editar vídeo', description: 'Grabar reels/TikToks según guión y editar con efectos y subtítulos.', responsible: 'Videógrafo', inputs: ['Guiones'], outputs: ['Videos editados'], tools: ['CapCut', 'Premiere'], estimated_minutes: 120, notes: '' },
      { id: crypto.randomUUID(), type: 'decision', title: '¿Aprobación del cliente?', description: 'El cliente revisa el contenido y da feedback.', responsible: 'Account Manager', inputs: ['Contenido completo'], outputs: ['Feedback'], tools: ['Notion', 'WhatsApp'], estimated_minutes: null, notes: '', conditions: [{ label: 'Aprobado', nextStepId: '' }, { label: 'Cambios necesarios', nextStepId: '' }] },
      { id: crypto.randomUUID(), type: 'task', title: 'Programar publicaciones', description: 'Programar contenido aprobado en las plataformas correspondientes.', responsible: 'Content Manager', inputs: ['Contenido aprobado', 'Calendario'], outputs: ['Publicaciones programadas'], tools: ['Meta Business Suite', 'Later'], estimated_minutes: 30, notes: '' },
      { id: crypto.randomUUID(), type: 'end', title: 'Contenido publicado', description: 'Todo el contenido del periodo está publicado o programado.', responsible: '', inputs: [], outputs: [], tools: [], estimated_minutes: null, notes: '' },
    ],
  },
  {
    title: 'Proceso de venta',
    description: 'Pipeline completo desde lead cualificado hasta cierre de venta.',
    category: 'ventas',
    icon: '💰',
    tags: ['ventas', 'closing', 'pipeline'],
    steps: [
      { id: crypto.randomUUID(), type: 'start', title: 'Lead cualificado recibido', description: 'Un lead ha sido cualificado por marketing o por referido.', responsible: 'Marketing', inputs: ['Lead info'], outputs: ['Lead en CRM'], tools: ['GHL'], estimated_minutes: null, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Primer contacto', description: 'Llamar o enviar mensaje al lead dentro de las primeras 5 minutos.', responsible: 'Setter', inputs: ['Lead info'], outputs: ['Conversación iniciada'], tools: ['GHL', 'WhatsApp'], estimated_minutes: 5, notes: 'Speed to lead es crucial' },
      { id: crypto.randomUUID(), type: 'task', title: 'Cualificación BANT', description: 'Cualificar usando Budget, Authority, Need, Timeline.', responsible: 'Setter', inputs: ['Conversación'], outputs: ['Lead cualificado/descartado'], tools: ['GHL'], estimated_minutes: 15, notes: '' },
      { id: crypto.randomUUID(), type: 'decision', title: '¿Lead cualificado?', description: 'Determinar si el lead cumple los criterios para pasar a llamada de cierre.', responsible: 'Setter', inputs: ['Info BANT'], outputs: ['Decisión'], tools: [], estimated_minutes: null, notes: '', conditions: [{ label: 'Cualificado → Agendar call', nextStepId: '' }, { label: 'No cualificado → Nurturing', nextStepId: '' }] },
      { id: crypto.randomUUID(), type: 'task', title: 'Llamada de cierre', description: 'Realizar la llamada de venta: presentar propuesta, manejar objeciones, cerrar.', responsible: 'Closer', inputs: ['Info del lead', 'Propuesta'], outputs: ['Cierre o follow-up'], tools: ['Google Meet', 'GHL'], estimated_minutes: 45, notes: '' },
      { id: crypto.randomUUID(), type: 'decision', title: '¿Cierre exitoso?', description: 'El lead acepta la propuesta y está listo para firmar.', responsible: 'Closer', inputs: ['Resultado de la call'], outputs: ['Contrato o follow-up'], tools: [], estimated_minutes: null, notes: '', conditions: [{ label: 'Sí → Contrato', nextStepId: '' }, { label: 'No → Follow-up', nextStepId: '' }] },
      { id: crypto.randomUUID(), type: 'task', title: 'Enviar contrato y cobrar', description: 'Enviar el contrato, configurar la pasarela de pago y confirmar el cobro.', responsible: 'Closer', inputs: ['Aceptación verbal'], outputs: ['Contrato firmado', 'Pago recibido'], tools: ['Stripe', 'PandaDoc'], estimated_minutes: 20, notes: '' },
      { id: crypto.randomUUID(), type: 'end', title: 'Venta cerrada', description: 'El cliente ha firmado y pagado. Pasar a onboarding.', responsible: '', inputs: [], outputs: ['Nuevo cliente'], tools: [], estimated_minutes: null, notes: '' },
    ],
  },
  {
    title: 'Reporte mensual de cliente',
    description: 'Proceso para generar y presentar el informe mensual de resultados.',
    category: 'operaciones',
    icon: '📊',
    tags: ['reporte', 'métricas', 'cliente'],
    steps: [
      { id: crypto.randomUUID(), type: 'start', title: 'Inicio del ciclo de reporting', description: 'Primer día laborable del mes.', responsible: 'Account Manager', inputs: [], outputs: [], tools: [], estimated_minutes: null, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Recopilar métricas', description: 'Extraer datos de Meta Ads, Google Ads, CRM, analytics de redes.', responsible: 'Media Buyer', inputs: ['Accesos plataformas'], outputs: ['Datos crudos'], tools: ['Meta Ads', 'Google Ads', 'GHL', 'Instagram Insights'], estimated_minutes: 45, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Analizar resultados', description: 'Comparar KPIs vs objetivos, identificar tendencias y oportunidades de mejora.', responsible: 'Account Manager', inputs: ['Datos crudos', 'Objetivos del mes'], outputs: ['Análisis completo'], tools: ['Google Sheets', 'Notion'], estimated_minutes: 60, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Crear presentación', description: 'Montar el reporte visual con gráficos, insights y plan de acción.', responsible: 'Account Manager', inputs: ['Análisis'], outputs: ['Presentación lista'], tools: ['Google Slides', 'Canva'], estimated_minutes: 45, notes: '' },
      { id: crypto.randomUUID(), type: 'task', title: 'Reunión con el cliente', description: 'Presentar resultados, discutir aprendizajes y alinear próximos pasos.', responsible: 'Account Manager', inputs: ['Presentación'], outputs: ['Feedback', 'Próximos pasos'], tools: ['Google Meet'], estimated_minutes: 30, notes: '' },
      { id: crypto.randomUUID(), type: 'end', title: 'Reporte entregado', description: 'Reporte enviado y próximos pasos acordados.', responsible: '', inputs: [], outputs: [], tools: [], estimated_minutes: null, notes: '' },
    ],
  },
]
