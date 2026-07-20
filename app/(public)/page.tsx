import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'

export default async function HomePage() {
  const event = await getEventSettings()

  return (
    <>
      <HeroSection event={event} />
      <AboutSection event={event} />
      <EventInfoSection event={event} />
      {/* Phases 6-9 sections will be added here */}
    </>
  )
}

