'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SmilePlus, X } from 'lucide-react'

const EMOJI_LIST = [
  '📄', '📝', '📋', '📌', '📎', '📁', '📂', '🗂️',
  '💡', '🎯', '🚀', '⚡', '🔥', '✨', '💎', '🏆',
  '📊', '📈', '📉', '🗃️', '🔧', '⚙️', '🛠️', '🔑',
  '🎨', '🖼️', '🎬', '📸', '🎵', '🎤', '📱', '💻',
  '🌐', '🔗', '📧', '💬', '📢', '🔔', '❤️', '⭐',
  '✅', '❌', '⚠️', '📍', '🏠', '🏢', '👥', '👤',
  '💰', '💳', '📦', '🛒', '🏷️', '📅', '⏰', '🗓️',
  '🧠', '📚', '🎓', '🔬', '🧪', '💊', '🏥', '🦷',
]

export function IconPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (icon: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-14 w-14 text-3xl p-0 hover:bg-accent transition-colors">
          {value || <SmilePlus className="h-7 w-7 text-muted-foreground/40" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-3">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-accent transition-colors"
              onClick={() => {
                onChange(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        {value && (
          <button
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
          >
            <X className="h-3 w-3" />
            Quitar icono
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
