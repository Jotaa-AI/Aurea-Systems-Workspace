'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { fetchAIContext, upsertAIContext } from '@/app/(workspace)/ai-context/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Fingerprint, X, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function BrandIdentityPanel() {
  const workspace = useWorkspaceStore((s) => s.workspace)
  const queryClient = useQueryClient()

  const { data: context, isLoading } = useQuery({
    queryKey: ['ai-context', workspace?.id],
    queryFn: () => fetchAIContext(workspace!.id),
    enabled: !!workspace,
  })

  const [brandName, setBrandName] = useState('')
  const [brandDescription, setBrandDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [toneOfVoice, setToneOfVoice] = useState('')
  const [keyTopics, setKeyTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [differentiators, setDifferentiators] = useState('')
  const [language, setLanguage] = useState('es')
  const [extraInstructions, setExtraInstructions] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (context) {
      setBrandName(context.brand_name)
      setBrandDescription(context.brand_description)
      setTargetAudience(context.target_audience)
      setToneOfVoice(context.tone_of_voice)
      setKeyTopics(context.key_topics)
      setDifferentiators(context.differentiators)
      setLanguage(context.language)
      setExtraInstructions(context.extra_instructions)
    }
  }, [context])

  async function handleSave() {
    if (!workspace) return
    setSaving(true)
    try {
      await upsertAIContext(workspace.id, {
        brand_name: brandName,
        brand_description: brandDescription,
        target_audience: targetAudience,
        tone_of_voice: toneOfVoice,
        key_topics: keyTopics,
        differentiators,
        language,
        extra_instructions: extraInstructions,
      })
      queryClient.invalidateQueries({ queryKey: ['ai-context', workspace.id] })
      toast.success('Identidad de marca guardada')
    } catch {
      toast.error('Error guardando')
    } finally {
      setSaving(false)
    }
  }

  function addTopic() {
    const t = newTopic.trim()
    if (t && !keyTopics.includes(t)) {
      setKeyTopics([...keyTopics, t])
      setNewTopic('')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-3xl px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Fingerprint className="h-6 w-6 text-purple-500" />
              Identidad de marca
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              La IA usara esta informacion para generar hooks, copys y hashtags que suenen a tu marca.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <p className="text-xs text-muted-foreground">
            Cuanto mas contexto aportes, mejor sera el contenido generado. Los botones "Generar con IA" en el editor de publicaciones usaran esta identidad.
          </p>
        </div>

        <div className="space-y-6">
          {/* Brand info */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold">Sobre la marca</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre de la marca</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Aurea Systems"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Idioma del contenido</Label>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="es, en, ca..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripcion de la marca</Label>
              <textarea
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                placeholder="Que hace tu marca, cual es su mision, a que se dedica..."
                rows={3}
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Audience + tone */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold">Audiencia y tono</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Publico objetivo</Label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe tu audiencia ideal: edad, intereses, problemas que resuelves, sector..."
                rows={3}
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tono de voz</Label>
              <Input
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                placeholder="Profesional pero cercano, inspirador, directo, provocador..."
              />
              <p className="text-[10px] text-muted-foreground">
                Como quieres que suene tu marca en redes sociales.
              </p>
            </div>
          </div>

          {/* Topics */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold">Temas clave</h2>
            <p className="text-xs text-muted-foreground">
              Los temas sobre los que gira tu contenido. La IA los usara para mantener coherencia.
            </p>
            <div className="flex flex-wrap gap-2">
              {keyTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="gap-1 pr-1">
                  {topic}
                  <button
                    className="ml-1 rounded-full hover:bg-foreground/10 p-0.5"
                    onClick={() => setKeyTopics(keyTopics.filter((t) => t !== topic))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Nuevo tema..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              />
              <Button variant="outline" size="sm" onClick={addTopic}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Differentiators */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold">Propuesta de valor</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Que te hace unico</Label>
              <textarea
                value={differentiators}
                onChange={(e) => setDifferentiators(e.target.value)}
                placeholder="Que diferencia a tu marca de la competencia, propuesta de valor unica, resultados que consigues..."
                rows={3}
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Extra instructions */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-semibold">Instrucciones para la IA</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Reglas y preferencias</Label>
              <textarea
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="Palabras a evitar, formato preferido, CTAs frecuentes, hashtags obligatorios, estilo de emojis, estructura de copys..."
                rows={4}
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
