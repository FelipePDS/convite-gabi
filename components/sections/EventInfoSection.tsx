'use client'

import { Calendar, Clock, MapPin, Shirt, Phone, Building2, ParkingSquare, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionReveal } from './SectionReveal'
import type { EventData } from '@/services/event'

interface InfoCardProps {
  icon: React.ReactNode
  label: string
  value: string
  delay?: number
  href?: string // when set the card becomes a link to Google Maps
}

function InfoCard({ icon, label, value, delay, href }: InfoCardProps) {
  const inner = (
    <div
      className={cn(
        'bg-card border-border flex items-start gap-4 rounded-2xl border p-6 shadow-sm transition-all',
        href
          ? 'cursor-pointer hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
          : 'hover:shadow-md'
      )}
      style={{ alignItems: 'center' }}
    >
      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground mb-0.5 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-foreground font-medium">{value}</p>
        {href && (
          <span className="text-primary mt-2 flex items-center gap-1 text-xs font-semibold">
            Abrir no Google Maps
            <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  )

  return (
    <SectionReveal delay={delay}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {inner}
        </a>
      ) : (
        inner
      )}
    </SectionReveal>
  )
}

interface EventInfoSectionProps {
  event: Pick<EventData, 'eventDate' | 'venueName' | 'address' | 'parking' | 'dressCode' | 'contact' | 'mapsUrl'>
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
    event.venueName && {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Local',
      value: event.venueName,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: 'Endereço',
      value: event.address,
      href: event.mapsUrl ?? undefined,
    },
    event.parking && {
      icon: <ParkingSquare className="h-5 w-5" />,
      label: 'Estacionamento',
      value: event.parking,
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
      </div>
    </section>
  )
}
