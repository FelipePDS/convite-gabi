import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { getGuestByInviteCode, trackInviteView } from '@/services/guests'
import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { GiftsSection } from '@/components/sections/GiftsSection'
import { MessageWallSection } from '@/components/sections/MessageWallSection'

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

  if (!guest.viewedAt) {
    await trackInviteView(guest.id)
  }

  const alreadyResponded = guest.status !== 'PENDING'
  const giftBuyer =
    guest.invitationCode && guest.phone
      ? {
          name: guest.name,
          phone: guest.phone,
          invitationCode: guest.invitationCode,
        }
      : null

  return (
    <>
      <div
        id="invite-onboarding-state"
        data-confirmed={alreadyResponded ? 'true' : 'false'}
        hidden
        aria-hidden
      />
      <HeroSection event={event} guestName={guest.name} />
      <AboutSection event={event} />
      <EventInfoSection event={event} />
      <RsvpSection
        event={event}
        prefill={{
          name: guest.name,
          phone: guest.phone ?? undefined,
          message: guest.message ?? undefined,
          status: guest.status,
          invitationCode: guest.invitationCode,
          companions: guest.companions,
        }}
      />
      <GiftsSection
        buyer={giftBuyer}
      />
      <MessageWallSection />
      <GallerySection />
      {/* <PixSection event={event} /> */}
    </>
  )
}
