'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Lightbox } from './Lightbox'
import { extractYouTubeId, youtubeThumbnail } from '@/lib/youtube'
import type { GalleryItemData } from '@/services/gallery'

interface GalleryGridProps {
  items: GalleryItemData[]
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
      {/* CSS columns masonry grid */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {items.map((item, i) => {
          const videoId = item.type === 'VIDEO' ? extractYouTubeId(item.url) : null
          const thumb = videoId ? youtubeThumbnail(videoId) : item.url

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
              onClick={() => setLightboxIndex(i)}
              className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={item.caption ?? `Abrir item ${i + 1} da galeria`}
            >
              <div className="relative overflow-hidden rounded-xl">
                {/* Thumbnail */}
                <div className="relative w-full">
                  <Image
                    src={thumb}
                    alt={item.caption ?? `Galeria item ${i + 1}`}
                    width={600}
                    height={400}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                  {item.type === 'VIDEO' && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-1 h-5 w-5 text-black" fill="black" />
                    </div>
                  )}
                </div>

                {/* Caption tooltip on hover */}
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm transition-transform duration-200 group-hover:translate-y-0">
                    {item.caption}
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Lightbox overlay */}
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
