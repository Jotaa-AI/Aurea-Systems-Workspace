'use client'

import { useEffect, useState } from 'react'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useSearchStore } from '@/lib/stores/search-store'
import { Button } from '@/components/ui/button'
import { PanelLeft, Search } from 'lucide-react'

export function Topbar({ title }: { title?: string }) {
  const { isOpen, toggle } = useSidebarStore()
  const openSearch = useSearchStore((s) => s.setOpen)

  // Show the right modifier key for the current OS
  const [modKey, setModKey] = useState<'⌘' | 'Ctrl'>('⌘')
  useEffect(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
    setModKey(isMac ? '⌘' : 'Ctrl')
  }, [])

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

      {/* Search trigger — right-aligned */}
      <button
        onClick={() => openSearch(true)}
        className="ml-auto flex items-center gap-2 rounded-md border bg-background/50 px-3 h-8 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px]">
          {modKey}K
        </kbd>
      </button>
    </header>
  )
}
