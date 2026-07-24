'use client'

import { motion, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import type { EventData } from '@/services/event'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

interface HeroSectionProps {
  event: Pick<EventData, 'title' | 'eventDate'>
  guestName?: string
}

export function HeroSection({ event, guestName }: HeroSectionProps) {
  const eventDateObj = new Date(event.eventDate)

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(eventDateObj)

  return (
    <section
      id="inicio"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#06152b] text-white"
      aria-labelledby="hero-title"
    >
      {/* Decorative background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, #06152b 0%, #091f3c 24%, #0e2b50 58%, #154a75 100%),
            radial-gradient(ellipse 80% 58% at 50% -8%, rgba(133, 205, 235, 0.15) 0%, transparent 62%),
            radial-gradient(ellipse 72% 54% at 50% 42%, rgba(9, 31, 60, 0.68) 0%, transparent 74%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={{
          background: `
            radial-gradient(130% 95% at 12% 100%, rgba(43, 110, 157, 0.5) 0%, transparent 48%),
            radial-gradient(110% 90% at 48% 100%, rgba(21, 74, 117, 0.66) 0%, transparent 50%),
            radial-gradient(120% 95% at 84% 100%, rgba(43, 110, 157, 0.48) 0%, transparent 46%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(133, 205, 235, 0.14) 1.2px, transparent 1.2px)',
          backgroundSize: '42px 42px',
          backgroundPosition: 'center center',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(6,21,43,0.88),transparent)]"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-4 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Tag line — personalized when guestName is present */}
        <motion.p
          variants={item}
          className="text-primary text-xs font-medium uppercase tracking-[0.35em]"
        >
          {guestName ? `✦ Olá, ${guestName}! ✦` : '✦ Você está convidado ✦'}
        </motion.p>

        {/* Main title */}
        <motion.h1
          id="hero-title"
          variants={item}
          className="font-heading max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {event.title}
        </motion.h1>

        {/* Date */}
        <motion.p
          variants={item}
          className="text-base font-light text-white/70 sm:text-lg md:text-xl"
        >
          {formattedDate}
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={item}
          aria-hidden
          className="bg-primary/60 h-px w-24"
        />

        {/* Countdown */}
        <motion.div variants={item}>
          <CountdownTimer eventDate={event.eventDate} />
        </motion.div>

        {/* CTA buttons */}
        {/* <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
          <a
            href="/#confirmar"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Confirmar presença ✦
          </a>
          <a
            href="/#presentes"
            className="rounded-full border border-white/25 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
          >
            Ver presentes
          </a>
        </motion.div> */}
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#sobre"
        aria-label="Ir para a seção Sobre"
        className="absolute bottom-8 flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="text-xs uppercase tracking-widest">Saiba mais</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.a>
    </section>
  )
}
