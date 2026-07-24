'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { extractYouTubeId } from '@/lib/youtube'
import type { GalleryItemData } from '@/services/gallery'

const EASE = [0.32, 0.72, 0, 1] as [number, number, number, number]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

interface LightboxProps {
  items: GalleryItemData[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  const current = items[index]

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next))
      if (clamped === index) return
      setDirection(next > index ? 1 : -1)
      setIndex(clamped)
    },
    [index, items.length]
  )

  const goPrev = useCallback(() => go(index - 1), [go, index])
  const goNext = useCallback(() => go(index + 1), [go, index])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) goNext()
    else if (info.offset.x > 80) goPrev()
  }

  const videoId = current.type === 'VIDEO' ? extractYouTubeId(current.url) : null

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex h-dvh flex-col bg-black/95 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Galeria — item ${index + 1} de ${items.length}`}
      >
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="text-sm font-medium text-white/60">
            {index + 1} / {items.length}
          </span>
          {current.caption && (
            <p className="mx-4 max-w-xs truncate text-center text-sm text-white/80">
              {current.caption}
            </p>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Fechar galeria"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2 sm:px-12 sm:py-4"
          onClick={(event) => event.stopPropagation()}
        >
          {index > 0 && (
            <button
              className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:left-4"
              onClick={goPrev}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              drag={items.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="flex h-full min-h-0 w-full items-center justify-center"
            >
              {videoId ? (
                <div className="flex h-full w-full max-w-5xl items-center">
                  <div className="relative aspect-video w-full max-h-full">
                    <iframe
                      key={videoId}
                      className="absolute inset-0 h-full w-full rounded-xl"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                      title={current.caption ?? 'Vídeo'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full min-h-0">
                  <Image
                    src={current.url}
                    alt={current.caption ?? `Imagem ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                    draggable={false}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {index < items.length - 1 && (
            <button
              className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
              onClick={goNext}
              aria-label="Próximo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {items.length > 1 && items.length <= 20 && (
          <div
            className="flex shrink-0 justify-center gap-1.5 py-4"
            onClick={(event) => event.stopPropagation()}
          >
            {items.map((_, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => go(itemIndex)}
                aria-label={`Ir para item ${itemIndex + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  itemIndex === index ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
