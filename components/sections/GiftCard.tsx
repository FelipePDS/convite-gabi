'use client'

import { Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GiftData } from '@/services/gifts'

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

interface GiftCardProps {
  gift: GiftData
  disabled?: boolean
  viewMode?: 'grid' | 'list'
  onOpen: (gift: GiftData) => void
}

export function GiftCard({
  gift,
  disabled = false,
  viewMode = 'grid',
  onOpen,
}: GiftCardProps) {
  const isReserved = gift.status === 'RESERVED'
  const isList = viewMode === 'list'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border-border group overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${
        isList ? 'flex flex-row items-stretch' : 'flex flex-col'
      }`}
    >
      <div
        className={`bg-muted relative overflow-hidden ${
          isList ? 'w-28 shrink-0 sm:w-36' : 'aspect-square'
        }`}
      >
        {gift.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isReserved ? 'opacity-60 grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gift className="text-muted-foreground/30 h-16 w-16" />
          </div>
        )}

        {isReserved && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              Reservado
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-3 p-4 ${isList ? 'justify-between' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-heading font-semibold leading-snug ${
              isList ? 'line-clamp-3 text-lg' : 'line-clamp-2 text-base'
            }`}
          >
            {gift.name}
          </h3>
          {isReserved && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Reservado
            </Badge>
          )}
        </div>

        {gift.description && (
          <p className={`text-muted-foreground text-sm ${isList ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {gift.description}
          </p>
        )}

        <div className={`mt-auto flex ${isList ? 'items-end justify-between gap-4' : 'flex-col gap-3'}`}>
          <div>
            {gift.price != null ? (
              <p className="font-heading text-primary text-lg font-bold">{formatBRL(gift.price)}</p>
            ) : (
              <p className="text-muted-foreground text-sm">Valor a combinar</p>
            )}
          </div>

          <Button
            size="sm"
            variant={disabled || isReserved ? 'secondary' : 'default'}
            disabled={disabled || isReserved}
            onClick={() => onOpen(gift)}
            className={isList ? 'shrink-0' : 'w-full'}
            aria-label={
              isReserved
                ? `${gift.name} ja foi reservado`
                : disabled
                  ? gift.price == null
                    ? `${gift.name} ainda nao possui valor configurado`
                    : `Use seu link de convite para comprar ${gift.name}`
                  : `Abrir checkout para ${gift.name}`
            }
          >
            {isReserved
              ? 'Reservado'
              : disabled
                ? gift.price == null
                  ? 'Preco pendente'
                  : 'Use seu link de convite'
                : 'Presentear'}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
