import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { GiftsSection } from '@/components/sections/GiftsSection'
import { PixSection } from '@/components/sections/PixSection'

export default async function HomePage() {
  const event = await getEventSettings()

  return (
    <>
      <HeroSection event={event} />
      <AboutSection event={event} />
      <GallerySection />
      <EventInfoSection event={event} />
      <RsvpSection event={event} />
      <GiftsSection />
      <PixSection event={event} />
    </>
  )
}

