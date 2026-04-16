'use client'

import { useState } from 'react'
import { SOP_TEMPLATES, getCategoryConfig, type SOPTemplate } from '@/lib/process-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Layers, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  onSelectTemplate: (template: SOPTemplate) => Promise<void>
}

export function TemplateGallery({ onSelectTemplate }: Props) {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)

  async function handleSelect(idx: number) {
    setLoadingIdx(idx)
    try {
      await onSelectTemplate(SOP_TEMPLATES[idx])
    } finally {
      setLoadingIdx(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Plantillas de SOP</h3>
        <p className="text-xs text-muted-foreground">
          Empieza rápido con una plantilla basada en metodología BPMN. Personalízala después.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOP_TEMPLATES.map((tpl, idx) => {
          const cat = getCategoryConfig(tpl.category)
          return (
            <div
              key={idx}
              className="rounded-lg border p-4 space-y-3 hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{tpl.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {tpl.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  <div className={cn('h-2 w-2 rounded-full mr-1', cat.color)} />
                  {cat.label}
                </Badge>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {tpl.steps.length} pasos
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => handleSelect(idx)}
                disabled={loadingIdx !== null}
              >
                {loadingIdx === idx ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Usar plantilla
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
