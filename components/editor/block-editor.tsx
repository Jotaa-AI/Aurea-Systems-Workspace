'use client'

import { useCallback, useRef } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import { useUpdatePageContent } from '@/lib/hooks/use-pages'
import { useTheme } from 'next-themes'

const AUTOSAVE_DELAY = 1000

export function BlockEditor({
  pageId,
  initialContent,
}: {
  pageId: string
  initialContent?: unknown
}) {
  const { resolvedTheme } = useTheme()
  const updateContent = useUpdatePageContent()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote({
    initialContent: initialContent && Array.isArray(initialContent) && initialContent.length > 0
      ? initialContent as any
      : undefined,
  })

  const handleChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const content = editor.document
      updateContent.mutate({ pageId, content })
    }, AUTOSAVE_DELAY)
  }, [editor, pageId, updateContent])

  return (
    <div className="min-h-[500px]">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        data-theming-css-variables-demo
      />
    </div>
  )
}
