import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background border-border/50 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Brand */}
          <div className="font-heading flex items-center gap-2 text-xl font-semibold">
            <Heart className="text-primary h-5 w-5 fill-current" />
            <span>Gaby 15 anos</span>
          </div>

          {/* Nav links */}
          <nav aria-label="Links de rodapé">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { href: '#sobre', label: 'Sobre' },
                { href: '#evento', label: 'Evento' },
                { href: '#galeria', label: 'Galeria' },
                { href: '#confirmar', label: 'Confirmar' },
                { href: '#presentes', label: 'Presentes' },
                { href: '#pix', label: 'PIX' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Separator className="max-w-xs" />

          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            Feito com <Heart className="text-primary inline h-3 w-3 fill-current" /> · {year}
          </p>
        </div>
      </div>
    </footer>
  )
}
