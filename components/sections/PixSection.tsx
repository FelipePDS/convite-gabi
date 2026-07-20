import { SectionReveal } from './SectionReveal'
import { PixCard } from './PixCard'
import type { EventData } from '@/services/event'

interface PixSectionProps {
  event: Pick<EventData, 'pixKey' | 'qrCodeUrl'>
}

export function PixSection({ event }: PixSectionProps) {
  // Hide section entirely if no PIX key is configured
  if (!event.pixKey) return null

  return (
    <section
      id="pix"
      className="bg-neutral-950 py-24 md:py-32"
      aria-labelledby="pix-title"
    >
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[oklch(0.62_0.12_68/15%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 md:px-8">
        {/* Heading */}
        <SectionReveal className="mb-12 text-center">
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Contribuição ✦
          </p>
          <h2
            id="pix-title"
            className="font-heading text-4xl font-bold tracking-tight text-white md:text-5xl"
          >
            Presente via PIX
          </h2>
          <p className="mt-4 text-white/60">
            Se preferir presentear em dinheiro, contribua via PIX com o QR Code ou a chave abaixo.
          </p>
        </SectionReveal>

        {/* Card */}
        <SectionReveal delay={0.15} className="flex justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <PixCard pixKey={event.pixKey} qrCodeUrl={event.qrCodeUrl} />
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
