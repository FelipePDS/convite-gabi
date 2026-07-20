import { WhatsAppButton } from './WhatsAppButton'
import { MusicPlayer } from './MusicPlayer'

interface FloatingActionsProps {
  musicSrc?: string
}

export function FloatingActions({ musicSrc }: FloatingActionsProps) {
  return (
    <div
      className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3"
      aria-label="Ações rápidas"
    >
      {musicSrc && <MusicPlayer src={musicSrc} />}
      <WhatsAppButton />
    </div>
  )
}
