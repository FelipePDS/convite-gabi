'use client'

import { useEffect } from 'react'
import { ArrowDownRight, X } from 'lucide-react'

interface QuickActionsOnboardingProps {
  open: boolean
  onClose: () => void
}

const DISPLAY_TIME_MS = 30000

export function QuickActionsOnboarding({
  open,
  onClose,
}: QuickActionsOnboardingProps) {
  useEffect(() => {
    if (!open) return

    const timeoutId = window.setTimeout(() => {
      onClose()
    }, DISPLAY_TIME_MS)

    return () => window.clearTimeout(timeoutId)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]">
      <div className="absolute inset-0 bg-[#06152b]/18" aria-hidden />

      <div className="absolute right-[7.6rem] bottom-[7.2rem] max-w-[250px] sm:right-[8.8rem] sm:bottom-[6.8rem] sm:max-w-[290px]">
        <div className="pointer-events-auto relative rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-left text-[#0d2342] shadow-[0_18px_50px_rgba(3,10,24,0.22)] backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="mb-2 ml-auto flex h-7 w-7 items-center justify-center rounded-full text-[#0d2342]/60 transition-colors hover:bg-[#0d2342]/8 hover:text-[#0d2342]"
            aria-label="Fechar orientação"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#216eac]">
            Dica rápida
          </p>
          <p className="mt-2 text-sm font-semibold leading-5">
            Use estes botões para confirmar presença e escolher um presente.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#0d2342]/72">
            Eles ficam sempre visíveis para facilitar sua navegação.
          </p>

          <div className="absolute right-[-2.2rem] bottom-[0.4rem] text-[#85cdeb] drop-shadow-[0_8px_16px_rgba(9,31,60,0.35)]">
            <ArrowDownRight className="h-14 w-14 animate-bounce" strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  )
}
