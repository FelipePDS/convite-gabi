'use client'

import { Calendar, Clock, MapPin, Shirt, Phone } from 'lucide-react'
import { SectionReveal } from './SectionReveal'
import type { EventData } from '@/services/event'

interface InfoCardProps {
  icon: React.ReactNode
  label: string
  value: string
  delay?: number
}

function InfoCard({ icon, label, value, delay }: InfoCardProps) {
  return (
    <SectionReveal delay={delay}>
      <div className="bg-card border-border flex items-start gap-4 rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5 text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-foreground font-medium">{value}</p>
        </div>
      </div>
    </SectionReveal>
  )
}

interface EventInfoSectionProps {
  event: Pick<EventData, 'eventDate' | 'address' | 'parking' | 'dressCode' | 'contact' | 'mapsUrl'>
}

export function EventInfoSection({ event }: EventInfoSectionProps) {
  const date = new Date(event.eventDate)

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date)

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date)

  const infoCards = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Data',
      value: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Horário',
      value: `A partir das ${formattedTime}`,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: event.parking ? 'Endereço & Estacionamento' : 'Endereço',
      value: event.parking ? `${event.address} — ${event.parking}` : event.address,
    },
    event.dressCode && {
      icon: <Shirt className="h-5 w-5" />,
      label: 'Traje',
      value: event.dressCode,
    },
    event.contact && {
      icon: <Phone className="h-5 w-5" />,
      label: 'Contato',
      value: event.contact,
    },
  ].filter(Boolean) as InfoCardProps[]

  return (
    <section
      id="evento"
      className="bg-muted/40 py-24 md:py-32"
      aria-labelledby="event-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Heading */}
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Informações ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2
            id="event-title"
            className="font-heading mb-12 max-w-md text-4xl font-bold tracking-tight md:text-5xl"
          >
            Detalhes do evento
          </h2>
        </SectionReveal>

        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoCards.map((card, i) => (
            <InfoCard key={card.label} {...card} delay={i * 0.08} />
          ))}
        </div>

        {/* Google Maps embed */}
        {event.mapsUrl && (
          <SectionReveal delay={0.3} className="mt-12">
            <div className="overflow-hidden rounded-2xl border shadow-md">
              <iframe
                src={event.mapsUrl}
                width="100%"
                height="400"
                className="block"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do evento"
                aria-label="Mapa da localização do evento"
              />
            </div>
          </SectionReveal>
        )}
      </div>
    </section>
  )
}
