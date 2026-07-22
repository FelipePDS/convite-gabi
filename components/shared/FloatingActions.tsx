import { Check, Gift } from 'lucide-react'
import { MusicPlayer } from './MusicPlayer'

interface FloatingActionsProps {
  musicSrc?: string
}

export function FloatingActions({ musicSrc }: FloatingActionsProps) {
  return (
    <div
      className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3"
      aria-label="Acoes rapidas"
    >
      <div className="flex flex-col items-end gap-2">
        <a
          href="#presentes"
          className="bg-background/88 text-foreground hover:bg-background flex w-[115px] items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-sm ring-1 ring-border transition-all hover:-translate-y-0.5"
          aria-label="Ir para a secao de presentes"
        >
          <Gift className="h-3.5 w-3.5 text-primary" />
          <span>Presentear</span>
        </a>

        <a
          href="#confirmar"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-[115px] items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium shadow-lg transition-all hover:-translate-y-0.5"
          aria-label="Ir para a secao de confirmacao de presenca"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Confirmar</span>
        </a>
      </div>

      {musicSrc && <MusicPlayer src={musicSrc} />}
    </div>
  )
}
