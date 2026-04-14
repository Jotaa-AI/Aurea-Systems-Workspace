'use client'

import { getPlatformConfig, FORMAT_LABELS, STATUS_CONFIG } from '@/lib/content-config'
import { Badge } from '@/components/ui/badge'
import { Film, Image as ImageIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ContentItem } from '@/types/database'

export function ContentGrid({
  items,
  onSelectItem,
}: {
  items: ContentItem[]
  onSelectItem: (item: ContentItem) => void
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">No hay contenido todavia</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const platform = getPlatformConfig(item.platform)
        const statusCfg = STATUS_CONFIG[item.status]
        const hasMedia = item.media_urls.length > 0
        const isVideo = hasMedia && /\.(mp4|mov|avi|webm)$/i.test(item.media_urls[0])

        return (
          <div
            key={item.id}
            className="group rounded-lg border overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => onSelectItem(item)}
          >
            {/* Media preview */}
            <div className="relative aspect-square bg-muted">
              {hasMedia ? (
                isVideo ? (
                  <video
                    src={item.media_urls[0]}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.media_urls[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className={cn('mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white', platform.color)}>
                      {item.format === 'reel' || item.format === 'video' || item.format === 'short'
                        ? <Film className="h-5 w-5" />
                        : <ImageIcon className="h-5 w-5" />
                      }
                    </div>
                    <span className="text-xs text-muted-foreground">{FORMAT_LABELS[item.format]}</span>
                  </div>
                </div>
              )}

              {/* Overlay badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900', platform.color)} />
              </div>
              {item.media_urls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  1/{item.media_urls.length}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Badge variant="secondary" className={cn('text-[10px] px-1.5', statusCfg.style)}>
                  {statusCfg.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{platform.label}</span>
              </div>

              {item.hook && (
                <p className="text-sm font-medium line-clamp-1 mb-1">{item.hook}</p>
              )}
              <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>

              {item.scheduled_for && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(item.scheduled_for), "dd MMM yyyy · HH:mm", { locale: es })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
