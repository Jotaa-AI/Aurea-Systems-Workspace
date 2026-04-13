'use client'

import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'
import type { Page } from '@/types/database'

export function Breadcrumbs({ ancestors }: { ancestors: { id: string; title: string; icon: string | null }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/pages"
        className="hover:text-foreground transition-colors"
      >
        Paginas
      </Link>
      {ancestors.map((page) => (
        <span key={page.id} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/pages/${page.id}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {page.icon ? (
              <span className="text-xs">{page.icon}</span>
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className="max-w-[120px] truncate">{page.title}</span>
          </Link>
        </span>
      ))}
    </nav>
  )
}
