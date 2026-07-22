'use client'

import { SectionReveal } from './SectionReveal'
import { RsvpForm } from './RsvpForm'
import type { EventData } from '@/services/event'

interface RsvpSectionProps {
  event: Pick<EventData, 'eventDate'>
  prefill?: {
    name?: string
    phone?: string
    invitationCode: string
  }
  initialConfirmedName?: string
}

export function RsvpSection({ event, prefill, initialConfirmedName }: RsvpSectionProps) {
  return (
    <section
      id="confirmar"
      className="bg-background py-24 md:py-32"
      aria-labelledby="rsvp-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:px-8">
        {/* Heading */}
        <div className="text-center">
          <SectionReveal>
            <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
              ✦ Confirmação ✦
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h2
              id="rsvp-title"
              className="font-heading text-4xl font-bold tracking-tight md:text-5xl"
            >
              Confirme sua presença
            </h2>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <p className="text-muted-foreground mt-4 max-w-md">
              Sua presença tornará esse dia ainda mais especial para nós.
              <br />
              Pedimos, por gentileza, que confirme sua presença até o dia{' '}
              <strong>01 de setembro</strong>, pois o buffet será contratado de acordo com o número de convidados confirmados.
            </p>
          </SectionReveal>
        </div>

        {/* Form */}
        <SectionReveal delay={0.2} className="w-full max-w-lg">
          <RsvpForm eventDate={event.eventDate} prefill={prefill} initialConfirmedName={initialConfirmedName} />
        </SectionReveal>
      </div>
    </section>
  )
}
