'use client'

import { useMemo, useRef, useState } from 'react'
import {
  useCreatePageComment,
  useDeletePageComment,
  usePageComments,
  useRealtimePageComments,
  useToggleCommentResolved,
  useUpdatePageComment,
} from '@/lib/hooks/use-page-comments'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Reply,
  Send,
  Trash2,
  X,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import type { PageComment } from '@/types/database'

type Props = {
  pageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Comments side panel anchored to the right of the page content.
 * Keeps the editor visible — the user can reference what they're
 * commenting on without the panel stealing focus.
 */
export function PageCommentsPanel({ pageId, open, onOpenChange }: Props) {
  const { data: comments = [], isLoading } = usePageComments(pageId)
  useRealtimePageComments(pageId)

  const [showResolved, setShowResolved] = useState(false)

  // Build threaded structure: top-level comments with their replies
  const threads = useMemo(() => {
    const roots: PageComment[] = []
    const replies = new Map<string, PageComment[]>()

    for (const c of comments) {
      if (c.parent_id) {
        if (!replies.has(c.parent_id)) replies.set(c.parent_id, [])
        replies.get(c.parent_id)!.push(c)
      } else {
        roots.push(c)
      }
    }

    return roots.map((r) => ({
      root: r,
      replies: replies.get(r.id) ?? [],
    }))
  }, [comments])

  const visibleThreads = showResolved
    ? threads
    : threads.filter((t) => !t.root.resolved)

  const unresolvedCount = threads.filter((t) => !t.root.resolved).length

  if (!open) return null

  return (
    <aside className="w-[380px] shrink-0 border-l bg-background flex flex-col h-[calc(100vh-3rem)] sticky top-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 h-12">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Comentarios</h3>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-medium px-1.5 h-4 min-w-4">
              {unresolvedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowResolved((v) => !v)}
          >
            {showResolved ? 'Ocultar resueltos' : 'Ver resueltos'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : visibleThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {threads.length === 0
                ? 'Sin comentarios todavía'
                : 'Sin comentarios sin resolver'}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Deja el primero abajo para iniciar una discusión.
            </p>
          </div>
        ) : (
          visibleThreads.map(({ root, replies }) => (
            <Thread
              key={root.id}
              root={root}
              replies={replies}
              pageId={pageId}
            />
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        <Composer pageId={pageId} />
      </div>
    </aside>
  )
}

function Thread({
  root,
  replies,
  pageId,
}: {
  root: PageComment
  replies: PageComment[]
  pageId: string
}) {
  const [replying, setReplying] = useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2 transition-colors',
        root.resolved && 'opacity-60 bg-muted/30'
      )}
    >
      <CommentCard comment={root} pageId={pageId} isRoot />

      {replies.length > 0 && (
        <div className="pl-4 border-l ml-3 space-y-2">
          {replies.map((r) => (
            <CommentCard key={r.id} comment={r} pageId={pageId} />
          ))}
        </div>
      )}

      {!root.resolved && (
        <>
          {replying ? (
            <div className="pt-1">
              <Composer
                pageId={pageId}
                parentId={root.id}
                autoFocus
                onDone={() => setReplying(false)}
                onCancel={() => setReplying(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setReplying(true)}
            >
              <Reply className="mr-1 h-3 w-3" />
              Responder
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function CommentCard({
  comment,
  pageId,
  isRoot = false,
}: {
  comment: PageComment
  pageId: string
  isRoot?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)

  const update = useUpdatePageComment(pageId)
  const remove = useDeletePageComment(pageId)
  const toggle = useToggleCommentResolved(pageId)

  const initials =
    comment.author_name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?'

  async function handleSaveEdit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      toast.error('El comentario no puede estar vacío')
      return
    }
    try {
      await update.mutateAsync({ id: comment.id, body: trimmed })
      setEditing(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al editar')
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este comentario?')) return
    try {
      await remove.mutateAsync(comment.id)
      toast.success('Comentario eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function handleToggleResolved() {
    try {
      await toggle.mutateAsync({ id: comment.id, resolved: !comment.resolved })
    } catch {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium">{comment.author_name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-[10px] text-muted-foreground italic">
                editado
              </span>
            )}
            {isRoot && comment.resolved && (
              <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Resuelto
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSaveEdit}
                  disabled={update.isPending}
                >
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditing(false)
                    setDraft(comment.body)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">
              {comment.body}
            </p>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            {isRoot && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleToggleResolved}
                title={comment.resolved ? 'Reabrir' : 'Marcar como resuelto'}
              >
                {comment.resolved ? (
                  <Circle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center rounded-md h-6 w-6 hover:bg-accent"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}

function Composer({
  pageId,
  parentId,
  autoFocus,
  onDone,
  onCancel,
}: {
  pageId: string
  parentId?: string
  autoFocus?: boolean
  onDone?: () => void
  onCancel?: () => void
}) {
  const [body, setBody] = useState('')
  const create = useCreatePageComment(pageId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit() {
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      await create.mutateAsync({ body: trimmed, parentId })
      setBody('')
      onDone?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al comentar')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl + Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={parentId ? 'Escribe tu respuesta...' : 'Añade un comentario...'}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          <kbd className="px-1 rounded bg-muted font-mono">⌘↵</kbd> para enviar
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSubmit}
            disabled={!body.trim() || create.isPending}
          >
            {create.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Send className="mr-1 h-3 w-3" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
