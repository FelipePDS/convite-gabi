'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Gift } from 'lucide-react'
import { GiftCard } from './GiftCard'
import { ReserveModal } from './ReserveModal'
import type { GiftData } from '@/services/gifts'

interface GiftsGridProps {
  initialGifts: GiftData[]
}

export function GiftsGrid({ initialGifts }: GiftsGridProps) {
  const [gifts, setGifts] = useState<GiftData[]>(initialGifts)
  const [reservingGift, setReservingGift] = useState<GiftData | null>(null)

  const handleReserveSuccess = (giftId: string, reservedByName: string) => {
    // Optimistic update
    setGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, status: 'RESERVED', reservedByName } : g
      )
    )
  }

  if (gifts.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
        <Gift className="h-12 w-12 opacity-30" />
        <p className="text-sm">Nenhum presente cadastrado ainda. Volte em breve!</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onReserve={setReservingGift} />
          ))}
        </div>
      </AnimatePresence>

      <ReserveModal
        gift={reservingGift}
        open={!!reservingGift}
        onOpenChange={(open) => {
          if (!open) setReservingGift(null)
        }}
        onSuccess={handleReserveSuccess}
      />
    </>
  )
}
