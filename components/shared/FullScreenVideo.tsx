'use client'

import { useRef, useState } from 'react'

type FullScreenVideoProps = {
  onFinished?: () => void
}

const formatRemaining = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const secs = safeSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const FullScreenVideo = ({ onFinished }: FullScreenVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(true)
  const [started, setStarted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  const updateRemainingTime = () => {
    const video = videoRef.current
    if (!video) return

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0
    setRemainingTime(Math.max(0, duration - currentTime))
  }

  const handleStart = async () => {
    const video = videoRef.current
    if (!video || isStarting) return

    setIsStarting(true)
    setError(null)

    try {
      video.currentTime = 0
      video.muted = false
      await video.play()
      setStarted(true)
      updateRemainingTime()
    } catch (err) {
      console.error('Nao foi possivel iniciar o video.', err)
      setError('Toque para tentar novamente e liberar a reproducao do video.')
    } finally {
      setIsStarting(false)
    }
  }

  const handlePause = () => {
    const video = videoRef.current
    if (!video || !started || video.ended) return

    void video.play().catch(() => {})
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[999999] h-dvh w-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/videos/abertura.mp4"
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        onLoadedMetadata={updateRemainingTime}
        onTimeUpdate={updateRemainingTime}
        onPause={handlePause}
        onEnded={() => {
          setVisible(false)
          onFinished?.()
        }}
        className="h-full w-full object-cover object-center select-none md:object-contain"
        style={{ pointerEvents: 'none' }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_38%),linear-gradient(to_top,rgba(0,0,0,0.7),rgba(0,0,0,0.18),rgba(0,0,0,0.7))]" />

      {!started && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-5 text-center">
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white shadow-[0_0_60px_rgba(255,255,255,0.2)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white/18 disabled:cursor-wait disabled:opacity-80"
            >
              <span className="absolute inset-0 rounded-full border border-white/35 animate-ping" />
              <span className="absolute inset-[-14px] rounded-full border border-white/15 animate-pulse" />
              <span className="relative ml-1 border-y-[18px] border-y-transparent border-l-[28px] border-l-white" />
            </button>

            <div className="max-w-sm space-y-2">
              {/* <p className="font-heading text-2xl font-semibold text-white">
                {isStarting ? 'Iniciando video...' : 'Toque para iniciar a abertura'}
              </p> */}
              {/* <p className="text-sm text-white/80">
                Depois que comecar, o video sera exibido ate o final automaticamente.
              </p> */}
              {error && <p className="text-sm text-rose-200">{error}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-8 flex justify-center px-6">
        <div className="rounded-full px-5 py-2.5 text-center text-white">
          {/* <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">Tempo restante</p> */}
          <p className="font-heading text-2xl font-semibold tabular-nums">
            {formatRemaining(remainingTime)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FullScreenVideo
