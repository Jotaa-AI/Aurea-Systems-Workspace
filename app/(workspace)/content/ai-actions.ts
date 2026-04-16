'use server'

import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase/server'
import type { ContentPlatform, ContentFormat } from '@/types/database'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type AIContext = {
  brand_name: string
  brand_description: string
  target_audience: string
  tone_of_voice: string
  key_topics: string[]
  differentiators: string
  language: string
  extra_instructions: string
}

async function getAIContext(workspaceId: string): Promise<AIContext | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('ai_contexts')
    .select('brand_name, brand_description, target_audience, tone_of_voice, key_topics, differentiators, language, extra_instructions')
    .eq('workspace_id', workspaceId)
    .single()
  return data as AIContext | null
}

function buildSystemPrompt(ctx: AIContext | null): string {
  if (!ctx) {
    return `Eres un experto en marketing digital y copywriting para redes sociales. Genera contenido creativo, atractivo y optimizado para engagement. Responde en español.`
  }

  return `Eres un experto en marketing digital y copywriting para redes sociales.
Trabajas para la marca "${ctx.brand_name}".

SOBRE LA MARCA:
${ctx.brand_description}

PUBLICO OBJETIVO:
${ctx.target_audience}

TONO DE VOZ:
${ctx.tone_of_voice}

TEMAS CLAVE:
${ctx.key_topics.join(', ')}

DIFERENCIADORES:
${ctx.differentiators}

INSTRUCCIONES ADICIONALES:
${ctx.extra_instructions}

Responde siempre en ${ctx.language === 'es' ? 'español' : ctx.language}.
Genera contenido que sea autentico a la voz de la marca, no generico.`
}

function getPlatformGuidelines(platform: ContentPlatform, format: ContentFormat): string {
  const guidelines: Record<string, string> = {
    instagram: 'Instagram: usa emojis con moderacion, CTA claro, maximo 2200 caracteres. Los hashtags van al final separados.',
    tiktok: 'TikTok: tono informal y directo, hooks de 3 segundos, tendencias actuales, lenguaje conversacional.',
    facebook: 'Facebook: tono conversacional, preguntas que inviten a comentar, CTAs claros.',
    linkedin: 'LinkedIn: tono profesional pero humano, aporta valor, storytelling profesional, sin emojis excesivos.',
    x: 'X/Twitter: conciso y directo, maximo 280 caracteres, tono punzante, hashtags limitados (1-2).',
    youtube: 'YouTube: titulos SEO-friendly, descripciones detalladas, timestamps si aplica.',
    threads: 'Threads: conversacional, autentico, puede ser mas largo que X, sin hashtags necesariamente.',
  }

  const formatNotes: Record<string, string> = {
    reel: 'Es un Reel/video corto: el hook debe capturar en los primeros 2 segundos.',
    story: 'Es una Story: breve, directa, con CTA urgente.',
    carousel: 'Es un Carousel: la primera slide debe ser un gancho potente, el resto desarrolla la idea.',
    article: 'Es un Articulo: puede ser mas extenso y detallado.',
    short: 'Es un Short: ultra breve, impactante desde el primer segundo.',
    video: 'Es un Video: narrativa clara con introduccion, desarrollo y CTA.',
  }

  return `${guidelines[platform] ?? ''}\n${formatNotes[format] ?? ''}`
}

export async function generateHook(
  workspaceId: string,
  platform: ContentPlatform,
  format: ContentFormat,
  existingCaption?: string
): Promise<string> {
  const ctx = await getAIContext(workspaceId)
  const systemPrompt = buildSystemPrompt(ctx)
  const platformGuide = getPlatformGuidelines(platform, format)

  const userPrompt = `Genera UN hook/titulo potente para un contenido de ${platform} (formato: ${format}).
${platformGuide}
${existingCaption ? `\nEl caption/copy actual es:\n"${existingCaption}"\n\nEl hook debe complementar este copy.` : ''}

Responde SOLO con el hook, sin comillas, sin explicaciones, sin prefijos. Solo el texto del hook.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 150,
    temperature: 0.8,
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}

export async function generateCaption(
  workspaceId: string,
  platform: ContentPlatform,
  format: ContentFormat,
  existingHook?: string
): Promise<string> {
  const ctx = await getAIContext(workspaceId)
  const systemPrompt = buildSystemPrompt(ctx)
  const platformGuide = getPlatformGuidelines(platform, format)

  const userPrompt = `Genera un caption/copy completo para un contenido de ${platform} (formato: ${format}).
${platformGuide}
${existingHook ? `\nEl hook/titulo es:\n"${existingHook}"\n\nEl copy debe desarrollar y complementar este hook.` : ''}

Incluye:
- Texto principal atractivo
- CTA si es apropiado
- NO incluyas hashtags (se gestionan aparte)

Responde SOLO con el copy, sin explicaciones ni prefijos.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 500,
    temperature: 0.8,
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}

export async function generateHashtags(
  workspaceId: string,
  platform: ContentPlatform,
  hook?: string,
  caption?: string
): Promise<string[]> {
  const ctx = await getAIContext(workspaceId)
  const systemPrompt = buildSystemPrompt(ctx)

  const maxHashtags = platform === 'x' ? 3 : platform === 'linkedin' ? 5 : 15

  const userPrompt = `Genera hashtags relevantes para un contenido de ${platform}.
${hook ? `Hook: "${hook}"` : ''}
${caption ? `Copy: "${caption}"` : ''}

Maximo ${maxHashtags} hashtags. Mezcla hashtags populares con nicho.
Responde SOLO con los hashtags separados por espacios, cada uno con #. Sin explicaciones.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 200,
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content?.trim() ?? ''
  return text.split(/\s+/).filter((t) => t.startsWith('#'))
}
