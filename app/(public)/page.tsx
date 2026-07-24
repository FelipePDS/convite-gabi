import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GallerySkeleton } from '@/components/sections/GallerySkeleton'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { InviteLockedSection } from '@/components/sections/InviteLockedSection'
import { GiftsSection } from '@/components/sections/GiftsSection'
import { GiftsSkeleton } from '@/components/sections/GiftsSkeleton'

const SHARE_IMAGE = '/images/capa.jpeg'

export async function generateMetadata(): Promise<Metadata> {
  const event = await getEventSettings()
  const description =
    event.description?.split('\n')[0]?.slice(0, 160) ??
    'Você está convidado para uma celebração especial! Confirme sua presença.'

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: [
        {
          url: SHARE_IMAGE,
          alt: 'Gabriela, 15 Anos',
        },
      ],
    },
    twitter: {
      title: event.title,
      description,
      images: [SHARE_IMAGE],
    },
  }
}

export default async function HomePage() {
  const event = await getEventSettings()

  return (
    <>
      <HeroSection event={event} />
      <AboutSection event={event} />
      <Suspense fallback={<GallerySkeleton />}>
        <GallerySection />
      </Suspense>
      <EventInfoSection event={event} />
      <InviteLockedSection contact={event.contact} />
      <Suspense fallback={<GiftsSkeleton />}>
        <GiftsSection />
      </Suspense>
      {/* <PixSection event={event} /> */}
    </>
  )
}
