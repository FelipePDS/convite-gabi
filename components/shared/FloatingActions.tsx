import { Check, Gift, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MusicPlayer } from './MusicPlayer'

interface FloatingActionsProps {
  musicSrc?: string
  highlight?: boolean
}

export function FloatingActions({ musicSrc, highlight = false }: FloatingActionsProps) {
  return (
    <div
      className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3"
      aria-label="Ações rápidas"
    >
      <div className="flex flex-col items-end gap-2">
        <a
          href="#evento"
          className={cn(
            'flex w-[124px] items-center gap-2 rounded-full bg-white/92 px-3.5 py-2 text-xs font-medium text-[#0d2342] shadow-lg backdrop-blur-sm ring-1 ring-[#cfe1ee] transition-all hover:-translate-y-0.5 hover:bg-white',
            highlight && 'animate-pulse ring-2 ring-primary/45 shadow-[0_0_0_10px_rgba(255,255,255,0.08)]'
          )}
          aria-label="Ir para a seção de informações"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
            <Info className="h-3.5 w-3.5" strokeWidth={2.1} />
          </span>
          <span>Informações</span>
        </a>

        <a
          href="#confirmar"
          className={cn(
            'flex w-[124px] items-center gap-2 rounded-full bg-[#c9a84c] px-3.5 py-2 text-xs font-medium text-[#1f1603] shadow-lg ring-1 ring-[#e8c878] transition-all hover:-translate-y-0.5 hover:bg-[#d6b457]',
            highlight && 'animate-pulse ring-2 ring-[#fff2c2] shadow-[0_0_0_10px_rgba(201,168,76,0.18)]'
          )}
          aria-label="Ir para a seção de confirmação de presença"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#7a5a12]">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span>Confirmar</span>
        </a>

        <a
          href="#presentes"
          className={cn(
            'flex w-[124px] items-center gap-2 rounded-full bg-white/92 px-3.5 py-2 text-xs font-medium text-[#0d2342] shadow-lg backdrop-blur-sm ring-1 ring-[#cfe1ee] transition-all hover:-translate-y-0.5 hover:bg-white',
            highlight && 'animate-pulse ring-2 ring-primary/45 shadow-[0_0_0_10px_rgba(255,255,255,0.08)]'
          )}
          aria-label="Ir para a seção de presentes"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
            <Gift className="h-3.5 w-3.5" />
          </span>
          <span>Presentear</span>
        </a>
      </div>

      {musicSrc && <MusicPlayer src={musicSrc} />}
    </div>
  )
}
