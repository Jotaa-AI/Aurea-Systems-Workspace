'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './theme-toggle'
import { PageTree } from './page-tree'
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Key,
  Calendar,
  Settings,
  ChevronsLeft,
  LogOut,
  Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tareas', href: '/tasks', icon: CheckSquare },
  { label: 'Clientes', href: '/clients', icon: Users },
  { label: 'Contenido', href: '/content', icon: Calendar },
  { label: 'Prompts', href: '/prompts', icon: Sparkles },
  { label: 'Credenciales', href: '/credentials', icon: Key },
  { label: 'Ajustes', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, toggle } = useSidebarStore()
  const workspace = useWorkspaceStore((s) => s.workspace)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-sidebar transition-all duration-200',
        isOpen ? 'w-60' : 'w-0 overflow-hidden border-r-0'
      )}
    >
      {/* Workspace header */}
      <div className="flex h-12 items-center justify-between px-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent transition-colors truncate"
        >
          {workspace?.name ?? 'Aurea Systems'}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={toggle}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <Separator className="my-3" />

        {/* Page tree */}
        <PageTree
          activePath={
            pathname.startsWith('/pages/')
              ? pathname.replace('/pages/', '')
              : undefined
          }
        />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-2 space-y-1">
        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
