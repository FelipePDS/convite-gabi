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
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-950 text-white"
      aria-labelledby="hero-title"
    >
      {/* Decorative background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.62_0.12_68/30%),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, oklch(0.78 0.12 82 / 15%) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
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
