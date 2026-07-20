'use client'

import Image from 'next/image'
import { Gift, ExternalLink, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GiftData } from '@/services/gifts'

interface GiftCardProps {
  gift: GiftData
  onReserve: (gift: GiftData) => void
}

export function GiftCard({ gift, onReserve }: GiftCardProps) {
  const isReserved = gift.status === 'RESERVED'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-border group flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="bg-muted relative aspect-square overflow-hidden">
        {gift.imageUrl ? (
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isReserved ? 'opacity-60 grayscale' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gift className="text-muted-foreground/30 h-16 w-16" />
          </div>
        )}

        {/* Reserved overlay badge */}
        {isReserved && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5" />
              Reservado
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading line-clamp-2 text-base font-semibold leading-snug">
            {gift.name}
          </h3>
          <Badge
            variant={isReserved ? 'secondary' : 'outline'}
            className={
              isReserved
                ? 'shrink-0 text-xs'
                : 'border-primary/40 text-primary shrink-0 text-xs'
            }
          >
            {isReserved ? 'Reservado' : 'Disponível'}
          </Badge>
        </div>

        {gift.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{gift.description}</p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {gift.purchaseLink && (
            <a
              href={gift.purchaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Ver produto
            </a>
          )}

          <Button
            size="sm"
            variant={isReserved ? 'secondary' : 'default'}
            disabled={isReserved}
            onClick={() => !isReserved && onReserve(gift)}
            className="w-full"
            aria-label={isReserved ? `${gift.name} já foi reservado` : `Reservar ${gift.name}`}
          >
            {isReserved ? 'Reservado ✓' : 'Reservar'}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
