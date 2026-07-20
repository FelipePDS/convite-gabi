'use client'

import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculate(target: Date): TimeLeft {
  const diff = Math.max(target.getTime() - Date.now(), 0)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const UNITS = [
  { key: 'days' as const, label: 'dias' },
  { key: 'hours' as const, label: 'horas' },
  { key: 'minutes' as const, label: 'min' },
  { key: 'seconds' as const, label: 'seg' },
]

interface CountdownTimerProps {
  eventDate: string // ISO string
}

export function CountdownTimer({ eventDate }: CountdownTimerProps) {
  const target = new Date(eventDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const isPast = Date.now() > target.getTime()

  useEffect(() => {
    setTimeLeft(calculate(target))
    const id = setInterval(() => setTimeLeft(calculate(target)), 1_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate])

  if (isPast && timeLeft) {
    return (
      <p className="font-heading text-primary text-xl font-semibold tracking-wide">
        ✦ O grande dia chegou! ✦
      </p>
    )
  }

  return (
    <div className="flex items-end gap-3 sm:gap-5" aria-label="Contagem regressiva">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <div className="flex min-w-[60px] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-3xl font-bold tabular-nums backdrop-blur-sm sm:min-w-[72px] sm:text-4xl">
            {timeLeft ? pad(timeLeft[key]) : '--'}
          </div>
          <span className="text-xs font-medium uppercase tracking-widest text-white/60">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
