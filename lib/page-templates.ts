/**
 * Agency-oriented page templates — reusable starting points
 * for the kind of documents a 5-person marketing agency writes
 * over and over (proposals, monthly reports, kickoffs, briefs,
 * retros, 1:1s, client wikis).
 *
 * Content follows BlockNote PartialBlock format:
 *   { type, props, content, children }
 * Kept minimal on purpose — each template is a scaffold, not a
 * wall of boilerplate. Users fill the rest.
 */

export type PageTemplateCategory =
  | 'ventas'
  | 'cliente'
  | 'contenido'
  | 'interno'
  | 'documentacion'

export type PageTemplate = {
  id: string
  name: string
  description: string
  icon: string
  category: PageTemplateCategory
  defaultTitle: string
  content: unknown[]
}

export const TEMPLATE_CATEGORIES: Record<
  PageTemplateCategory,
  { label: string; color: string }
> = {
  ventas: { label: 'Ventas', color: 'text-green-400' },
  cliente: { label: 'Cliente', color: 'text-blue-400' },
  contenido: { label: 'Contenido', color: 'text-pink-400' },
  interno: { label: 'Interno', color: 'text-purple-400' },
  documentacion: { label: 'Documentación', color: 'text-orange-400' },
}

// --- Helpers to keep template definitions readable ---------------------------

const h1 = (text: string) => ({
  type: 'heading',
  props: { level: 1 },
  content: [{ type: 'text', text, styles: {} }],
})
const h2 = (text: string) => ({
  type: 'heading',
  props: { level: 2 },
  content: [{ type: 'text', text, styles: {} }],
})
const h3 = (text: string) => ({
  type: 'heading',
  props: { level: 3 },
  content: [{ type: 'text', text, styles: {} }],
})
const p = (text = '') => ({
  type: 'paragraph',
  content: text ? [{ type: 'text', text, styles: {} }] : [],
})
const bold = (text: string) => ({ type: 'text', text, styles: { bold: true } })
const italic = (text: string) => ({
  type: 'text',
  text,
  styles: { italic: true },
})
const plain = (text: string) => ({ type: 'text', text, styles: {} })
const pMixed = (parts: unknown[]) => ({ type: 'paragraph', content: parts })
const li = (text: string) => ({
  type: 'bulletListItem',
  content: [{ type: 'text', text, styles: {} }],
})
const check = (text: string, checked = false) => ({
  type: 'checkListItem',
  props: { checked },
  content: [{ type: 'text', text, styles: {} }],
})
const quote = (text: string) => ({
  type: 'quote',
  content: [{ type: 'text', text, styles: {} }],
})
const divider = () => ({ type: 'paragraph', content: [] })

// --- Templates ---------------------------------------------------------------

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'propuesta-comercial',
    name: 'Propuesta comercial',
    description: 'Propuesta estructurada con alcance, entregables, timeline e inversión.',
    icon: '💼',
    category: 'ventas',
    defaultTitle: 'Propuesta comercial — [Cliente]',
    content: [
      h1('Propuesta comercial'),
      pMixed([
        bold('Cliente: '),
        plain('[Nombre del cliente]'),
      ]),
      pMixed([
        bold('Fecha: '),
        plain('[DD/MM/YYYY]'),
      ]),
      pMixed([
        bold('Validez: '),
        plain('30 días desde la fecha de emisión'),
      ]),
      divider(),
      h2('Contexto y objetivos'),
      p('Resumen del punto de partida del cliente y lo que busca conseguir con este proyecto.'),
      h2('Alcance del trabajo'),
      p('Qué incluye esta propuesta — y qué no.'),
      h3('Incluye'),
      li('Entregable 1'),
      li('Entregable 2'),
      li('Entregable 3'),
      h3('No incluye'),
      li('Fuera de alcance 1'),
      li('Fuera de alcance 2'),
      h2('Metodología'),
      p('Cómo vamos a abordar el proyecto, fases y puntos de control.'),
      h2('Timeline'),
      pMixed([bold('Semana 1–2: '), plain('Descubrimiento y estrategia')]),
      pMixed([bold('Semana 3–4: '), plain('Producción y primeras entregas')]),
      pMixed([bold('Semana 5–6: '), plain('Iteración y cierre')]),
      h2('Equipo asignado'),
      li('[Nombre] — Rol'),
      li('[Nombre] — Rol'),
      h2('Inversión'),
      pMixed([bold('Setup inicial: '), plain('€X.XXX')]),
      pMixed([bold('Fee mensual: '), plain('€X.XXX / mes')]),
      pMixed([bold('Duración mínima: '), plain('X meses')]),
      p(''),
      quote('Precios en euros, IVA no incluido. Condiciones de pago: 50% al inicio, 50% a la entrega.'),
      h2('Siguientes pasos'),
      check('Firmar propuesta'),
      check('Pagar setup inicial'),
      check('Agendar kickoff'),
    ],
  },
  {
    id: 'reporte-mensual',
    name: 'Reporte mensual de cliente',
    description: 'Resumen ejecutivo del mes: KPIs, highlights, aprendizajes y próximos pasos.',
    icon: '📊',
    category: 'cliente',
    defaultTitle: 'Reporte mensual — [Cliente] — [Mes]',
    content: [
      h1('Reporte mensual'),
      pMixed([bold('Cliente: '), plain('[Nombre]')]),
      pMixed([bold('Período: '), plain('[Mes YYYY]')]),
      pMixed([bold('Preparado por: '), plain('[Nombre]')]),
      divider(),
      h2('Resumen ejecutivo'),
      p('Tres líneas sobre cómo fue el mes a nivel global — lo bueno, lo malo y lo que cambiamos.'),
      h2('KPIs del mes'),
      pMixed([bold('Leads: '), plain('XX (+/-X% vs mes anterior)')]),
      pMixed([bold('Citas agendadas: '), plain('XX')]),
      pMixed([bold('Citas asistidas: '), plain('XX (tasa de show: XX%)')]),
      pMixed([bold('Ingresos generados: '), plain('€XX.XXX')]),
      pMixed([bold('ROI: '), plain('XX')]),
      h2('Highlights'),
      li('Qué funcionó especialmente bien este mes'),
      li('Victorias o hitos a destacar'),
      h2('Retos y aprendizajes'),
      li('Qué no funcionó como esperábamos'),
      li('Qué aprendimos y cómo lo vamos a aplicar'),
      h2('Actividad del mes'),
      h3('Contenido publicado'),
      li('X piezas en [plataforma]'),
      h3('Campañas activas'),
      li('Nombre de la campaña — resultado'),
      h2('Próximo mes — plan'),
      check('Objetivo 1'),
      check('Objetivo 2'),
      check('Objetivo 3'),
      h2('Notas adicionales'),
      p('Cualquier cosa extra relevante que el cliente deba saber.'),
    ],
  },
  {
    id: 'kickoff-cliente',
    name: 'Kickoff de cliente',
    description: 'Reunión inicial con un cliente nuevo: objetivos, expectativas, acceso, próximos pasos.',
    icon: '🚀',
    category: 'cliente',
    defaultTitle: 'Kickoff — [Cliente]',
    content: [
      h1('Kickoff de cliente'),
      pMixed([bold('Cliente: '), plain('[Nombre]')]),
      pMixed([bold('Fecha: '), plain('[DD/MM/YYYY]')]),
      pMixed([bold('Asistentes: '), plain('[Nombres]')]),
      divider(),
      h2('Objetivos del cliente'),
      p('Qué quiere conseguir con nosotros en los próximos 3/6/12 meses.'),
      li('Objetivo 1 (con métrica concreta)'),
      li('Objetivo 2'),
      li('Objetivo 3'),
      h2('Contexto del negocio'),
      h3('Producto / servicio'),
      p('Qué vende, a quién y a qué precio.'),
      h3('Cliente ideal (ICP)'),
      p('Quién es el cliente perfecto y dónde está.'),
      h3('Competencia principal'),
      li('[Competidor 1]'),
      li('[Competidor 2]'),
      h3('Qué han probado antes'),
      p('Estrategias, agencias o campañas previas — qué funcionó y qué no.'),
      h2('Expectativas y ritmo de trabajo'),
      pMixed([bold('Reunión semanal: '), plain('[Día y hora]')]),
      pMixed([bold('Canal de comunicación: '), plain('[Slack / WhatsApp / email]')]),
      pMixed([bold('SLA de respuesta: '), plain('24h en horario laboral')]),
      h2('Accesos necesarios'),
      check('Analytics / Google Analytics'),
      check('Meta Business Manager'),
      check('CRM (GHL / HubSpot / etc.)'),
      check('Webflow / Wordpress'),
      check('Dominio y DNS'),
      check('Redes sociales del cliente'),
      h2('Riesgos detectados'),
      li('Riesgo 1 y cómo lo mitigamos'),
      h2('Próximos pasos'),
      check('Firmar contrato'),
      check('Compartir accesos'),
      check('Entregar brief de estrategia inicial'),
      check('Planificar primera reunión de revisión'),
    ],
  },
  {
    id: 'brief-contenido',
    name: 'Brief de contenido',
    description: 'Brief para crear una pieza de contenido: objetivo, audiencia, mensaje, formato.',
    icon: '✍️',
    category: 'contenido',
    defaultTitle: 'Brief — [Pieza]',
    content: [
      h1('Brief de contenido'),
      pMixed([bold('Cliente: '), plain('[Nombre]')]),
      pMixed([bold('Pieza: '), plain('[Título provisional]')]),
      pMixed([bold('Plataforma: '), plain('[Instagram / TikTok / LinkedIn / blog]')]),
      pMixed([bold('Fecha de publicación: '), plain('[DD/MM]')]),
      pMixed([bold('Responsable: '), plain('[Nombre]')]),
      divider(),
      h2('Objetivo'),
      p('Qué queremos conseguir con esta pieza (awareness, engagement, conversión, etc.).'),
      h2('Audiencia'),
      p('A quién va dirigida — sé específico. Dolor, deseo, contexto.'),
      h2('Mensaje principal'),
      p('Una sola idea que el lector debería recordar.'),
      h2('Hook'),
      p('Cómo vamos a captar la atención en los primeros 3 segundos.'),
      h2('Estructura propuesta'),
      li('Hook'),
      li('Punto 1'),
      li('Punto 2'),
      li('Cierre con CTA'),
      h2('CTA'),
      p('Qué queremos que el usuario haga después de consumir la pieza.'),
      h2('Referencias / inspiración'),
      li('[Link a pieza de referencia]'),
      h2('Restricciones / tono'),
      li('Tono: [profesional / cercano / directo]'),
      li('Cosas a evitar'),
      h2('Checklist de publicación'),
      check('Copy aprobado'),
      check('Visual aprobado'),
      check('Caption / descripción lista'),
      check('Hashtags definidos'),
      check('Programado'),
    ],
  },
  {
    id: 'reunion-notas',
    name: 'Notas de reunión',
    description: 'Plantilla genérica para cualquier reunión: agenda, decisiones, action items.',
    icon: '📝',
    category: 'interno',
    defaultTitle: 'Reunión — [Tema] — [DD/MM]',
    content: [
      h1('Notas de reunión'),
      pMixed([bold('Fecha: '), plain('[DD/MM/YYYY HH:MM]')]),
      pMixed([bold('Asistentes: '), plain('[Nombres]')]),
      pMixed([bold('Facilitador: '), plain('[Nombre]')]),
      divider(),
      h2('Agenda'),
      li('Tema 1'),
      li('Tema 2'),
      li('Tema 3'),
      h2('Discusión'),
      h3('Tema 1'),
      p(''),
      h3('Tema 2'),
      p(''),
      h2('Decisiones tomadas'),
      li('Decisión 1 — quién, qué, cuándo'),
      h2('Action items'),
      check('[Nombre] — tarea — fecha límite'),
      check('[Nombre] — tarea — fecha límite'),
      h2('Próxima reunión'),
      pMixed([bold('Fecha: '), plain('[DD/MM]')]),
      pMixed([bold('Objetivo: '), plain('[Qué queremos cerrar]')]),
    ],
  },
  {
    id: 'retro-mensual',
    name: 'Retrospectiva mensual',
    description: 'Retro interna del equipo: qué fue bien, qué no, qué cambiamos el próximo mes.',
    icon: '🔄',
    category: 'interno',
    defaultTitle: 'Retro — [Mes]',
    content: [
      h1('Retrospectiva mensual'),
      pMixed([bold('Mes: '), plain('[Mes YYYY]')]),
      pMixed([bold('Participantes: '), plain('[Nombres]')]),
      divider(),
      h2('Números del mes'),
      li('MRR: €XX.XXX (+/-X%)'),
      li('Clientes activos: XX'),
      li('Churn: XX'),
      li('Nuevos clientes firmados: XX'),
      h2('Lo que fue bien 🟢'),
      li(''),
      li(''),
      h2('Lo que no fue bien 🔴'),
      li(''),
      li(''),
      h2('Lo que aprendimos 💡'),
      li(''),
      h2('Experimentos para el próximo mes 🧪'),
      check('Experimento 1 — hipótesis — métrica de éxito'),
      check('Experimento 2'),
      h2('Compromisos del equipo'),
      check('[Nombre] — compromiso'),
    ],
  },
  {
    id: 'wiki-cliente',
    name: 'Wiki de cliente',
    description: 'Documentación viva de un cliente: contexto, contactos, accesos, procesos, decisiones.',
    icon: '📚',
    category: 'documentacion',
    defaultTitle: '[Cliente] — Wiki',
    content: [
      h1('Wiki de cliente'),
      pMixed([italic('Documento vivo — mantén esta página actualizada cada vez que haya un cambio importante.')]),
      divider(),
      h2('Contexto del cliente'),
      pMixed([bold('Nombre: '), plain('[Nombre legal]')]),
      pMixed([bold('Industria: '), plain('')]),
      pMixed([bold('Tamaño: '), plain('[Nº empleados]')]),
      pMixed([bold('Ubicación: '), plain('')]),
      pMixed([bold('Web: '), plain('')]),
      pMixed([bold('Cliente desde: '), plain('[MM/YYYY]')]),
      h2('Propuesta de valor'),
      p('Qué vende, a quién, cómo se diferencia.'),
      h2('Contactos'),
      h3('Decisor principal'),
      pMixed([bold('Nombre: '), plain('')]),
      pMixed([bold('Email: '), plain('')]),
      pMixed([bold('Teléfono: '), plain('')]),
      h3('Operativos'),
      li('[Nombre] — rol — contacto'),
      h2('Servicios que le damos'),
      li('Servicio 1'),
      li('Servicio 2'),
      h2('Objetivos en vigor'),
      li('Objetivo + métrica + deadline'),
      h2('Accesos y herramientas'),
      check('Analytics'),
      check('Meta Business'),
      check('CRM'),
      check('Web'),
      check('Otros'),
      h2('Historial de decisiones importantes'),
      h3('[DD/MM/YYYY] — Título de la decisión'),
      p('Qué decidimos, por qué y qué alternativas descartamos.'),
      h2('Cosas que hay que tener en cuenta'),
      li('Preferencias del cliente (tono, estilo, tiempos)'),
      li('Cosas que le molestan'),
      li('Cosas que le encantan'),
      h2('Tickets / incidencias abiertas'),
      li('Tema — responsable — estado'),
    ],
  },
  {
    id: 'one-on-one',
    name: '1:1 con miembro del equipo',
    description: 'Plantilla para reuniones 1:1 recurrentes: cómo estás, trabajo, crecimiento, feedback.',
    icon: '🤝',
    category: 'interno',
    defaultTitle: '1:1 — [Nombre] — [DD/MM]',
    content: [
      h1('1:1'),
      pMixed([bold('Con: '), plain('[Nombre]')]),
      pMixed([bold('Fecha: '), plain('[DD/MM/YYYY]')]),
      divider(),
      h2('¿Cómo estás?'),
      p('Check-in personal y profesional. No saltes esta parte.'),
      h2('Lo que está funcionando'),
      li(''),
      h2('Lo que te frustra o te frena'),
      li(''),
      h2('Proyectos en curso'),
      li('[Proyecto] — estado — bloqueos'),
      h2('Crecimiento y aprendizaje'),
      p('Qué habilidad quieres desarrollar, qué feedback te ayudaría.'),
      h2('Feedback para mí / la empresa'),
      p('¿Qué debería empezar/parar/seguir haciendo?'),
      h2('Action items'),
      check('[Responsable] — acción — fecha'),
      h2('Próxima 1:1'),
      pMixed([bold('Fecha: '), plain('[DD/MM]')]),
    ],
  },
]

export function getTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(
  category: PageTemplateCategory
): PageTemplate[] {
  return PAGE_TEMPLATES.filter((t) => t.category === category)
}
