'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Pause, Volume2 } from 'lucide-react'
import { useMusicStore } from '@/lib/stores/music'

interface MusicPlayerProps {
  src: string
}

export function MusicPlayer({ src }: MusicPlayerProps) {
  const { isPlaying, toggle } = useMusicStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    setMounted(true)

    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.35
    audioRef.current = audio

    // Show a subtle hint after 3 seconds to invite the user to play
    const t = setTimeout(() => setShowHint(true), 3_000)
    const t2 = setTimeout(() => setShowHint(false), 8_000)

    return () => {
      clearTimeout(t)
      clearTimeout(t2)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    if (!mounted || !audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
      setShowHint(false)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, mounted])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      {/* Tooltip hint */}
      <AnimatePresence>
        {showHint && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
          >
            🎵 Música de fundo
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pausar música' : 'Tocar música de fundo'}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
          isPlaying
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/80 text-foreground backdrop-blur-sm ring-1 ring-border'
        }`}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Music2 className="h-5 w-5" />
        )}

        {/* Pulse ring when playing */}
        {isPlaying && (
          <motion.span
            className="bg-primary/30 absolute h-12 w-12 rounded-full"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>
    </div>
  )
}

// Smaller inline "now playing" indicator used optionally
export function NowPlayingDot() {
  const { isPlaying } = useMusicStore()
  if (!isPlaying) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/60">
      <Volume2 className="h-3 w-3" /> tocando
    </span>
  )
}
