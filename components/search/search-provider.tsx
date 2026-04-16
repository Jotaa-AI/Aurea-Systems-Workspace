'use client'

import { useEffect } from 'react'
import { useSearchStore } from '@/lib/stores/search-store'
import { CommandPalette } from './command-palette'

export function SearchProvider() {
  const { open, setOpen, toggle } = useSearchStore()

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return <CommandPalette open={open} onOpenChange={setOpen} />
}
