'use client'

import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { getPlatformConfig, STATUS_CONFIG, FORMAT_LABELS } from '@/lib/content-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentItem } from '@/types/database'

export function ContentCalendar({
  items,
  onSelectItem,
}: {
  items: ContentItem[]
  onSelectItem: (item: ContentItem) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ContentItem[]>()
    for (const item of items) {
      const date = item.scheduled_for ?? item.created_at
      const key = format(new Date(date), 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setCurrentMonth(new Date())}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
          <div key={day} className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg border overflow-hidden bg-border">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayItems = itemsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, currentMonth)

          return (
            <div
              key={key}
              className={cn(
                'min-h-[100px] bg-background p-1.5',
                !inMonth && 'bg-muted/30'
              )}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs mb-1',
                isToday(day) && 'bg-primary text-primary-foreground font-bold',
                !inMonth && 'text-muted-foreground/50'
              )}>
                {format(day, 'd')}
              </div>

              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((item) => {
                  const platform = getPlatformConfig(item.platform)
                  return (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[10px] hover:bg-accent transition-colors text-left truncate"
                      onClick={() => onSelectItem(item)}
                    >
                      <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', platform.color)} />
                      <span className="truncate">{item.hook || item.caption.slice(0, 30) || FORMAT_LABELS[item.format]}</span>
                    </button>
                  )
                })}
                {dayItems.length > 3 && (
                  <span className="block px-1 text-[10px] text-muted-foreground">
                    +{dayItems.length - 3} mas
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
