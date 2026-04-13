'use client'

import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { Button } from '@/components/ui/button'
import { PanelLeft } from 'lucide-react'

export function Topbar({ title }: { title?: string }) {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <header className="flex h-12 items-center gap-2 border-b px-4">
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggle}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
      {title && (
        <h1 className="text-sm font-medium text-foreground/80">{title}</h1>
      )}
    </header>
  )
}
