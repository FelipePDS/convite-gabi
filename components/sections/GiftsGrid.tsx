'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Gift, LayoutGrid, Rows3 } from 'lucide-react'
import { GiftCard } from './GiftCard'
import { GiftPurchaseModal } from './GiftPurchaseModal'
import type { GiftData } from '@/services/gifts'

export type GiftBuyer = {
  name: string
  phone: string
  invitationCode: string
}

interface GiftsGridProps {
  initialGifts: GiftData[]
  buyer?: GiftBuyer | null
}

const sortGifts = (gifts: GiftData[]) =>
  [...gifts].sort((left, right) => {
    if (left.status === right.status) return 0
    if (left.status === 'RESERVED') return 1
    return -1
  })

export function GiftsGrid({ initialGifts, buyer = null }: GiftsGridProps) {
  const [gifts, setGifts] = useState<GiftData[]>(() => sortGifts(initialGifts))
  const [openGift, setOpenGift] = useState<GiftData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const canPurchase = Boolean(buyer?.invitationCode)

  const handlePurchaseSuccess = (giftId: string, updates?: Partial<GiftData>) => {
    setGifts((prev) =>
      sortGifts(
        prev.map((gift) =>
          gift.id === giftId
            ? {
                ...gift,
                ...updates,
                status: updates?.status ?? 'RESERVED',
              }
            : gift
        )
      )
    )
    setOpenGift((current) => {
      if (!current || current.id !== giftId) {
        return current
      }

      return {
        ...current,
        ...updates,
        status: updates?.status ?? 'RESERVED',
      }
    })
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
      <div className="mb-5 flex items-center justify-between gap-3">
        {/* <p className="text-muted-foreground text-sm">
          {gifts.length} presente(s) para navegar
        </p> */}

        <div className="bg-background/80 inline-flex items-center gap-1 rounded-full border px-1 py-1 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grade
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={viewMode === 'list'}
          >
            <Rows3 className="h-3.5 w-3.5" />
            Lista
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-4'
          }
        >
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              disabled={
                !canPurchase ||
                (gift.status === 'RESERVED' && !gift.canUndoReservation) ||
                (!gift.canUndoReservation && gift.price == null && !gift.purchaseUrl)
              }
              viewMode={viewMode}
              onOpen={setOpenGift}
            />
          ))}
        </div>
      </AnimatePresence>

      <GiftPurchaseModal
        gift={openGift}
        open={!!openGift}
        onOpenChange={(open) => {
          if (!open) setOpenGift(null)
        }}
        onSuccess={handlePurchaseSuccess}
        buyer={buyer}
      />
    </>
  )
}
