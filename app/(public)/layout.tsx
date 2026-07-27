'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { FloatingActions } from '@/components/shared/FloatingActions'
import { WelcomeConfetti } from '@/components/shared/WelcomeConfetti'
import { QuickActionsOnboarding } from '@/components/shared/QuickActionsOnboarding'
import FullScreenVideo from '@/components/shared/FullScreenVideo'

const INVITE_MARKER_ID = 'invite-onboarding-state'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const musicSrc = process.env.NEXT_PUBLIC_MUSIC_URL || undefined
  const pathname = usePathname()

  const [videoFinished, setVideoFinished] = useState(false)
  const [showQuickActionsOnboarding, setShowQuickActionsOnboarding] = useState(false)
  const [confirmedInvitePath, setConfirmedInvitePath] = useState<string | null>(null)

  const isInvitePage = /^\/invite\/[^/]+$/.test(pathname)
  const inviteConfirmedByMarker =
    typeof document !== 'undefined' &&
    document.getElementById(INVITE_MARKER_ID)?.getAttribute('data-confirmed') === 'true'
  const isInviteConfirmed = inviteConfirmedByMarker || confirmedInvitePath === pathname
  const shouldDisplayOnboarding =
    videoFinished && showQuickActionsOnboarding && (!isInvitePage || !isInviteConfirmed)

  useEffect(() => {
    const handleConfirmed = () => {
      setConfirmedInvitePath(pathname)
      setShowQuickActionsOnboarding(false)
    }

    window.addEventListener('invite-rsvp-confirmed', handleConfirmed)
    return () => window.removeEventListener('invite-rsvp-confirmed', handleConfirmed)
  }, [pathname])

  useEffect(() => {
    if (!videoFinished) return

    const timeoutId = window.setTimeout(() => {
      const inviteMarkerConfirmed =
        document.getElementById(INVITE_MARKER_ID)?.getAttribute('data-confirmed') === 'true'

      if (isInvitePage && (inviteMarkerConfirmed || confirmedInvitePath === pathname)) {
        return
      }

      setShowQuickActionsOnboarding(true)
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [confirmedInvitePath, isInvitePage, pathname, videoFinished])

  return (
    <>
      <FullScreenVideo onFinished={() => setVideoFinished(true)} />

      {videoFinished && <WelcomeConfetti />}
      <QuickActionsOnboarding
        open={shouldDisplayOnboarding}
        onClose={() => setShowQuickActionsOnboarding(false)}
      />

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions
        musicSrc={musicSrc}
        highlight={shouldDisplayOnboarding}
      />
    </>
  )
}
