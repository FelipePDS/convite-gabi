'use client'

import { SectionReveal } from './SectionReveal'
import { Lock, Mail } from 'lucide-react'

interface InviteLockedSectionProps {
  contact?: string | null
}

export function InviteLockedSection({ contact }: InviteLockedSectionProps) {
  return (
    <section
      id="confirmar"
      className="bg-background py-24 md:py-32"
      aria-labelledby="locked-rsvp-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:px-8">
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Confirmação ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1} className="w-full max-w-lg text-center">
          <div className="bg-card border-border flex flex-col items-center gap-6 rounded-3xl border p-10 shadow-xl">
            <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
              <Lock className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2
                id="locked-rsvp-title"
                className="font-heading text-2xl font-bold tracking-tight"
              >
                Confirmação por convite
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Para confirmar sua presença, utilize o{' '}
                <strong className="text-foreground">link personalizado</strong> que você
                recebeu. Cada convidado tem um link único que identifica você no evento.
              </p>
            </div>

            {contact && (
              <a
                href={`https://api.whatsapp.com/send?phone=${contact.replace(/\D/g, '')}&text=${encodeURIComponent('Olá! Não recebi meu link de convite. Pode me enviar?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-2 text-sm font-medium underline-offset-2 hover:underline"
              >
                <Mail className="h-4 w-4" />
                Não recebeu o link? Entre em contato
              </a>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
