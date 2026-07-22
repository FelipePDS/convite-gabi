'use client'

import { useState } from 'react'

import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { FloatingActions } from '@/components/shared/FloatingActions'
import { WelcomeConfetti } from '@/components/shared/WelcomeConfetti'
import FullScreenVideo from '@/components/shared/FullScreenVideo'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const musicSrc = process.env.NEXT_PUBLIC_MUSIC_URL || undefined

  const [videoFinished, setVideoFinished] = useState(false)

  return (
    <>
      <FullScreenVideo onFinished={() => setVideoFinished(true)} />

      {videoFinished && <WelcomeConfetti />}

      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions musicSrc={musicSrc} />
    </>
  )
}
