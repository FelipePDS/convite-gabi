import prisma from '@/lib/db'

export type EventData = {
  title: string
  description: string | null
  eventDate: string // ISO string – safe to pass from Server → Client Component
  venueName: string | null
  address: string
  mapsUrl: string | null
  parking: string | null
  dressCode: string | null
  contact: string | null
  pixKey: string | null
  qrCodeUrl: string | null
}

const DEFAULT_EVENT: EventData = {
  title: 'Aniversário da Gabi',
  description: 'Uma noite especial para celebrar mais um ano de vida cheia de alegria, amor e gratidão.',
  eventDate: new Date('2025-12-31T20:00:00.000-03:00').toISOString(),
  venueName: null,
  address: 'Endereço a confirmar',
  mapsUrl: null,
  parking: null,
  dressCode: 'Traje social',
  contact: null,
  pixKey: null,
  qrCodeUrl: null,
}

export async function getEventSettings(): Promise<EventData> {
  try {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 1 } })
    if (!settings) return DEFAULT_EVENT

    return {
      title: settings.title,
      description: settings.description ?? null,
      eventDate: settings.eventDate.toISOString(),
      venueName: settings.venueName ?? null,
      address: settings.address,
      mapsUrl: settings.mapsUrl ?? null,
      parking: settings.parking ?? null,
      dressCode: settings.dressCode ?? null,
      contact: settings.contact ?? null,
      pixKey: settings.pixKey ?? null,
      qrCodeUrl: settings.qrCodeUrl ?? null,
    }
  } catch {
    // DB not yet connected — return defaults so the page always renders
    return DEFAULT_EVENT
  }
}
