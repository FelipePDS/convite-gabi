import { getEventSettings } from '@/services/event'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { EventInfoSection } from '@/components/sections/EventInfoSection'
import { RsvpSection } from '@/components/sections/RsvpSection'

export default async function HomePage() {
  const event = await getEventSettings()

  return (
    <>
      <HeroSection event={event} />
      <AboutSection event={event} />
      <EventInfoSection event={event} />
      <RsvpSection event={event} />
      {/* Phases 7-9 sections will be added here */}
    </>
  )
}

