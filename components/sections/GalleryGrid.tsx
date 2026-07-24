'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Images, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Lightbox } from './Lightbox'
import { extractYouTubeId, youtubeThumbnail } from '@/lib/youtube'
import type { GalleryItemData } from '@/services/gallery'

const PREVIEW_LIMIT = 6

interface GalleryGridProps {
  items: GalleryItemData[]
}

function GalleryTile({
  item,
  index,
  onClick,
  compact = false,
}: {
  item: GalleryItemData
  index: number
  onClick: () => void
  compact?: boolean
}) {
  const videoId = item.type === 'VIDEO' ? extractYouTubeId(item.url) : null
  const thumb = videoId ? youtubeThumbnail(videoId) : item.url

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.04 }}
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={item.caption ?? `Abrir item ${index + 1} da galeria`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <div className={`relative w-full ${compact ? 'aspect-square' : 'aspect-[3/4]'}`}>
          <Image
            src={thumb}
            alt={item.caption ?? `Galeria item ${index + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={
              compact
                ? '(max-width: 640px) 44vw, 160px'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            }
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
          {item.type === 'VIDEO' && (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-5 w-5 text-black" fill="black" />
            </div>
          )}
        </div>

        {item.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-3 text-left">
            <p className="line-clamp-2 text-xs text-white/90">{item.caption}</p>
          </div>
        )}
      </div>
    </motion.button>
  )
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)

  const previewItems = useMemo(() => items.slice(0, PREVIEW_LIMIT), [items])
  const hasMoreItems = items.length > PREVIEW_LIMIT

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
        <ImageIcon className="h-12 w-12 opacity-30" />
        <p className="text-sm">A galeria será atualizada em breve. Volte depois!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
        {previewItems.map((item, index) => (
          <GalleryTile
            key={item.id}
            item={item}
            index={index}
            onClick={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      {hasMoreItems && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-6"
            onClick={() => setIsOverviewOpen(true)}
          >
            <Images className="h-4 w-4" />
            Ver todas as fotos
          </Button>
        </div>
      )}

      <Dialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-[min(1100px,calc(100%-1rem))] overflow-hidden p-0 sm:max-w-[min(1100px,calc(100%-2rem))]">
          <div className="flex max-h-[92vh] flex-col">
            <DialogHeader className="border-b px-5 pt-5 pb-4">
              <DialogTitle className="font-heading text-xl">Galeria completa</DialogTitle>
              <DialogDescription>
                {items.length} item(ns) para explorar com mais calma.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                  <GalleryTile
                    key={`${item.id}-modal`}
                    item={item}
                    index={index}
                    compact
                    onClick={() => {
                      setIsOverviewOpen(false)
                      setLightboxIndex(index)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
