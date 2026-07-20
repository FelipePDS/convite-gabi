import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Heart } from 'lucide-react'
import { getGuestByInviteCode, trackInviteView } from '@/services/guests'
import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { GiftsSection } from '@/components/sections/GiftsSection'
import { PixSection } from '@/components/sections/PixSection'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const guest = await getGuestByInviteCode(code)

  if (!guest) {
    return { title: 'Convite inválido', robots: { index: false } }
  }

  return {
    title: `Convite para ${guest.name}`,
    description: 'Você foi convidado para uma celebração especial!',
    robots: { index: false, follow: false },
  }
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params
  const [guest, event] = await Promise.all([
    getGuestByInviteCode(code),
    getEventSettings(),
  ])

  // ── Invalid code ──────────────────────────────────────────────────────────
  if (!guest) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-full">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold">Convite não encontrado</h1>
          <p className="text-muted-foreground max-w-sm">
            Este link de convite é inválido ou já expirou. Você ainda pode confirmar
            presença pela página principal.
          </p>
        </div>
        <Link
          href="/#confirmar"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-xl px-6 text-sm font-medium transition-colors"
        >
          Confirmar presença
        </Link>
      </div>
    )
  }

  // ── Track first view (best-effort, non-blocking) ───────────────────────────
  if (!guest.viewedAt) {
    await trackInviteView(guest.id)
  }

  // ── Already confirmed ─────────────────────────────────────────────────────
  if (guest.status === 'CONFIRMED') {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(event.eventDate))

    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold">
            Presença confirmada, {guest.name}!
          </h1>
          <p className="text-muted-foreground max-w-sm">
            Você já confirmou sua presença. Te esperamos no dia{' '}
            <strong className="text-foreground">{formattedDate}</strong>. 🎉
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Heart className="text-primary h-4 w-4 fill-current" />
          <Link href="/" className="text-primary underline-offset-2 hover:underline">
            Ver detalhes do evento
          </Link>
        </div>
      </div>
    )
  }

  // ── Full personalized invite ───────────────────────────────────────────────
  return (
    <>
      <HeroSection event={event} guestName={guest.name} />
      <AboutSection event={event} />
      <GallerySection />
      <EventInfoSection event={event} />
      <RsvpSection
        event={event}
        prefill={{
          name: guest.name,
          phone: guest.phone ?? undefined,
          invitationCode: guest.invitationCode,
        }}
      />
      <GiftsSection />
      <PixSection event={event} />
    </>
  )
}
