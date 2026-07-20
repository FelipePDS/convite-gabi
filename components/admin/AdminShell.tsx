'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Menu,
  LayoutDashboard,
  Users,
  Gift,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Heart,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/admin/guests', label: 'Convidados', icon: Users },
  { href: '/admin/gifts', label: 'Presentes', icon: Gift },
  { href: '/admin/gallery', label: 'Galeria', icon: ImageIcon },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
  )
}

function NavFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-border space-y-0.5 border-t p-2">
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
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
  )
}

interface AdminShellProps {
  children: React.ReactNode
  userEmail: string
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="bg-card border-border hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-14 items-center gap-2 border-b px-4">
          <Heart className="text-primary h-4 w-4 fill-current" />
          <span className="font-heading text-sm font-semibold">Admin</span>
        </div>
        <NavLinks />
        <NavFooter />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-border flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <button
              className="hover:bg-accent flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-border border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Heart className="text-primary h-4 w-4 fill-current" />
                  Admin
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <NavFooter onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Brand (mobile only) */}
          <div className="flex items-center gap-2 md:hidden">
            <Heart className="text-primary h-4 w-4 fill-current" />
            <span className="font-heading text-sm font-semibold">Admin</span>
          </div>

          <div className="flex-1" />

          <span className="text-muted-foreground max-w-[160px] truncate text-sm">
            {userEmail}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
