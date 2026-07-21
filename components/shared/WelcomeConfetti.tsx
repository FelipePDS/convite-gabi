'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const PALETTE = ['#C9A84C', '#E8C878', '#FFE4B5', '#ffffff', '#f0e6c8']

export function WelcomeConfetti() {
  useEffect(() => {
    // Initial big burst from both sides
    confetti({ particleCount: 60, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors: PALETTE })
    confetti({ particleCount: 60, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors: PALETTE })

    // Short shower that follows
    const end = Date.now() + 2_000
    const shower = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: PALETTE })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: PALETTE })
      if (Date.now() < end) requestAnimationFrame(shower)
    }

    const t = setTimeout(shower, 400)
    return () => clearTimeout(t)
  }, [])

  return null
}
