import { Suspense } from 'react'
import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GallerySkeleton } from '@/components/sections/GallerySkeleton'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { GiftsSection } from '@/components/sections/GiftsSection'
import { GiftsSkeleton } from '@/components/sections/GiftsSkeleton'
import { PixSection } from '@/components/sections/PixSection'

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
      <RsvpSection event={event} />
      <Suspense fallback={<GiftsSkeleton />}>
        <GiftsSection />
      </Suspense>
      <PixSection event={event} />
    </>
  )
}

