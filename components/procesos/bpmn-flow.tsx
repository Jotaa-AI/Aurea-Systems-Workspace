'use client'

import { useState } from 'react'
import type { ProcessStep, StepType } from '@/types/database'
import { getStepTypeConfig, STEP_TYPES, createDefaultStep } from '@/lib/process-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  ArrowRight,
  ArrowDown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  steps: ProcessStep[]
  onChange: (steps: ProcessStep[]) => void
  readOnly?: boolean
}

export function BPMNFlow({ steps, onChange, readOnly = false }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function updateStep(id: string, updates: Partial<ProcessStep>) {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  function addStep(index: number, type: StepType = 'task') {
    const newStep = createDefaultStep(type)
    const next = [...steps]
    next.splice(index + 1, 0, newStep)
    onChange(next)
    setExpandedId(newStep.id)
  }

  function removeStep(id: string) {
    onChange(steps.filter((s) => s.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    const next = [...steps]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function addListItem(stepId: string, field: 'inputs' | 'outputs' | 'tools', value: string) {
    const step = steps.find((s) => s.id === stepId)
    if (!step || !value.trim()) return
    const current = step[field]
    if (!current.includes(value.trim())) {
      updateStep(stepId, { [field]: [...current, value.trim()] })
    }
  }

  function removeListItem(stepId: string, field: 'inputs' | 'outputs' | 'tools', value: string) {
    const step = steps.find((s) => s.id === stepId)
    if (!step) return
    updateStep(stepId, { [field]: step[field].filter((v) => v !== value) })
  }

  if (steps.length === 0 && !readOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">🔄</div>
        <p className="text-sm text-muted-foreground mb-4">
          Empieza a mapear tu proceso agregando pasos BPMN.
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => addStep(-1, 'start')}>
            🟢 Agregar Inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const cfg = getStepTypeConfig(step.type)
        const isExpanded = expandedId === step.id

        return (
          <div key={step.id}>
            {/* Connector line */}
            {idx > 0 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
              </div>
            )}

            {/* Step card */}
            <div
              className={cn(
                'group relative rounded-lg border-2 transition-all',
                cfg.color,
                isExpanded ? 'shadow-md' : 'hover:shadow-sm'
              )}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : step.id)}
              >
                {!readOnly && (
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}

                <span className="text-lg shrink-0">{cfg.icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {cfg.label}
                    </Badge>
                    {readOnly ? (
                      <span className="text-sm font-medium truncate">{step.title}</span>
                    ) : (
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
                        placeholder="Título del paso..."
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {step.responsible && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <User className="h-2.5 w-2.5" />
                      {step.responsible}
                    </Badge>
                  )}
                  {step.estimated_minutes && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {step.estimated_minutes}m
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-4">
                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Descripción</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      readOnly={readOnly}
                      rows={2}
                      className="flex w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      placeholder="Describe qué se hace en este paso..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Responsible */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Responsable</label>
                      <Input
                        value={step.responsible}
                        onChange={(e) => updateStep(step.id, { responsible: e.target.value })}
                        readOnly={readOnly}
                        placeholder="Rol o persona..."
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Estimated time */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Tiempo estimado (min)</label>
                      <Input
                        type="number"
                        value={step.estimated_minutes ?? ''}
                        onChange={(e) =>
                          updateStep(step.id, {
                            estimated_minutes: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        readOnly={readOnly}
                        placeholder="30"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Inputs / Outputs / Tools */}
                  <div className="grid grid-cols-3 gap-4">
                    <TagListField
                      label="Entradas"
                      items={step.inputs}
                      readOnly={readOnly}
                      onAdd={(v) => addListItem(step.id, 'inputs', v)}
                      onRemove={(v) => removeListItem(step.id, 'inputs', v)}
                      placeholder="Documento..."
                      badgeStyle="bg-blue-500/10 text-blue-400"
                    />
                    <TagListField
                      label="Salidas"
                      items={step.outputs}
                      readOnly={readOnly}
                      onAdd={(v) => addListItem(step.id, 'outputs', v)}
                      onRemove={(v) => removeListItem(step.id, 'outputs', v)}
                      placeholder="Resultado..."
                      badgeStyle="bg-green-500/10 text-green-400"
                    />
                    <TagListField
                      label="Herramientas"
                      items={step.tools}
                      readOnly={readOnly}
                      onAdd={(v) => addListItem(step.id, 'tools', v)}
                      onRemove={(v) => removeListItem(step.id, 'tools', v)}
                      placeholder="CRM..."
                      badgeStyle="bg-purple-500/10 text-purple-400"
                    />
                  </div>

                  {/* Decision conditions */}
                  {step.type === 'decision' && step.conditions && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Condiciones</label>
                      <div className="space-y-2">
                        {step.conditions.map((cond, ci) => (
                          <div key={ci} className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                            <Input
                              value={cond.label}
                              onChange={(e) => {
                                const newConds = [...(step.conditions ?? [])]
                                newConds[ci] = { ...newConds[ci], label: e.target.value }
                                updateStep(step.id, { conditions: newConds })
                              }}
                              readOnly={readOnly}
                              placeholder="Condición..."
                              className="h-7 text-sm flex-1"
                            />
                            {!readOnly && step.conditions!.length > 1 && (
                              <button
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  const newConds = step.conditions!.filter((_, i) => i !== ci)
                                  updateStep(step.id, { conditions: newConds })
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => {
                              const newConds = [...(step.conditions ?? []), { label: '', nextStepId: '' }]
                              updateStep(step.id, { conditions: newConds })
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Agregar condición
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(step.notes || !readOnly) && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Notas</label>
                      <textarea
                        value={step.notes}
                        onChange={(e) => updateStep(step.id, { notes: e.target.value })}
                        readOnly={readOnly}
                        rows={2}
                        className="flex w-full rounded-md border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                        placeholder="Notas adicionales, tips, consideraciones..."
                      />
                    </div>
                  )}

                  {/* Step actions */}
                  {!readOnly && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => moveStep(idx, -1)}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="h-3 w-3" /> Subir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => moveStep(idx, 1)}
                          disabled={idx === steps.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" /> Bajar
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add step button between steps */}
            {!readOnly && (
              <div className="flex justify-center py-1">
                <DropdownMenu>
                  <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 hover:!opacity-100 focus:opacity-100 transition-opacity rounded-full border border-dashed border-muted-foreground/30 p-1 hover:border-primary hover:bg-primary/5">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {STEP_TYPES.map((st) => (
                      <DropdownMenuItem key={st.value} onClick={() => addStep(idx, st.value)}>
                        <span className="mr-2">{st.icon}</span>
                        {st.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Tag list field component ──────────────────────── */
function TagListField({
  label,
  items,
  readOnly,
  onAdd,
  onRemove,
  placeholder,
  badgeStyle,
}: {
  label: string
  items: string[]
  readOnly: boolean
  onAdd: (value: string) => void
  onRemove: (value: string) => void
  placeholder: string
  badgeStyle: string
}) {
  const [value, setValue] = useState('')
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className={cn('text-[10px] gap-1 pr-1', badgeStyle)}>
            {item}
            {!readOnly && (
              <button className="hover:bg-foreground/10 rounded-full p-0.5" onClick={() => onRemove(item)}>
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!readOnly && (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd(value)
              setValue('')
            }
          }}
          placeholder={placeholder}
          className="h-7 text-xs"
        />
      )}
    </div>
  )
}
