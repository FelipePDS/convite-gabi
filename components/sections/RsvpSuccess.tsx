'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Heart, PartyPopper, Users } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'

const GOLD_PALETTE = ['#C9A84C', '#E8C878', '#FFE4B5', '#F5DEB3', '#fff7e6']

function launchConfetti() {
  const end = Date.now() + 3_000

  const burst = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: GOLD_PALETTE,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: GOLD_PALETTE,
    })
    if (Date.now() < end) requestAnimationFrame(burst)
  }

  burst()
}

interface RsvpSuccessProps {
  guestName: string
  eventDate: string
  companions?: string[]
  onReset?: () => void
  onEdit?: () => void
}

export function RsvpSuccess({
  guestName,
  eventDate,
  companions = [],
  onReset,
  onEdit,
}: RsvpSuccessProps) {
  useEffect(() => {
    launchConfetti()
  }, [])

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(eventDate))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="bg-card border-border flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border p-10 text-center shadow-xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
        className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full"
      >
        <CheckCircle2 className="h-8 w-8" />
      </motion.div>

      <div className="space-y-2">
        <h3 className="font-heading text-2xl font-bold">Presenca confirmada!</h3>
        <p className="text-muted-foreground">
          Que alegria, <span className="text-foreground font-semibold">{guestName}</span>!
          <br />
          Te esperamos no dia{' '}
          <span className="text-foreground font-semibold">{formattedDate}</span>.
        </p>
      </div>

      <div className="text-primary flex items-center gap-2 text-sm font-medium">
        <PartyPopper className="h-4 w-4" />
        <span>Vai ser incrivel!</span>
        <Heart className="h-4 w-4 fill-current" />
      </div>

      <div className="bg-muted/60 w-full rounded-2xl px-4 py-3 text-left">
        <div className="mb-2 flex items-center gap-2">
          <Users className="text-primary h-4 w-4" />
          <p className="text-sm font-semibold">Acompanhantes</p>
        </div>
        {companions.length > 0 ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">
              {companions.length} acompanhante(s) confirmado(s) com voce:
            </p>
            <ul className="space-y-1 text-sm">
              {companions.map((companion) => (
                <li key={companion} className="text-foreground">
                  {companion}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhum acompanhante adicionado por enquanto.
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Gerenciar acompanhantes
          </Button>
        )}

        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Confirmar outro convidado
          </Button>
        )}
      </div>
    </motion.div>
  )
}
