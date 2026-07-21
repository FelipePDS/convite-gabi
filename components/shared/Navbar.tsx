'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, Sun, Moon, Heart } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#evento', label: 'Evento' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#confirmar', label: 'Confirmar' },
  { href: '#presentes', label: 'Presentes' },
  { href: '#pix', label: 'PIX' },
]

function ThemeToggle({ scrolled }: { scrolled: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
        scrolled
          ? 'text-foreground/70 hover:bg-accent hover:text-foreground'
          : 'text-white/70 hover:text-white'
      )}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8"
        aria-label="Navegação principal"
      >
        {/* Brand */}
        <Link
          href="/"
          className={cn(
            'font-heading flex items-center gap-1.5 text-lg font-semibold tracking-wide transition-colors',
            scrolled ? 'text-foreground' : 'text-white'
          )}
        >
          <Heart className="text-primary h-4 w-4 fill-current" />
          <span>Gabi</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-foreground/70 hover:text-foreground'
                    : 'text-white/80 hover:text-white'
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle scrolled={scrolled} />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle scrolled={scrolled} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                scrolled
                  ? 'text-foreground/70 hover:bg-accent hover:text-foreground'
                  : 'text-white/80 hover:text-white'
              )}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading flex items-center gap-2 text-left text-lg">
                  <Heart className="text-primary h-4 w-4 fill-current" />
                  Gabi
                </SheetTitle>
              </SheetHeader>
              <ul className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent block rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
