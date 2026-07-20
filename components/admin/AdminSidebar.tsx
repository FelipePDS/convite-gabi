'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Gift,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/admin/guests', label: 'Convidados', icon: Users },
  { href: '/admin/gifts', label: 'Presentes', icon: Gift },
  { href: '/admin/gallery', label: 'Galeria', icon: ImageIcon },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="bg-card border-border flex w-60 shrink-0 flex-col border-r">
      {/* Brand */}
      <div className="border-border flex h-14 items-center gap-2 border-b px-4">
        <Heart className="text-primary h-4 w-4 fill-current" />
        <span className="font-heading text-sm font-semibold">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(href, exact)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="border-border space-y-0.5 border-t p-2">
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Ver site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
