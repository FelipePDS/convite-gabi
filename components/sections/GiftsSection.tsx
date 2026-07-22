import { SectionReveal } from './SectionReveal'
import { GiftsGrid, type GiftBuyer } from './GiftsGrid'
import { getGifts } from '@/services/gifts'

interface GiftsSectionProps {
  buyer?: GiftBuyer | null
}

export async function GiftsSection({ buyer = null }: GiftsSectionProps = {}) {
  const gifts = await getGifts()

  return (
    <section
      id="presentes"
      className="bg-muted/30 py-24 md:py-32"
      aria-labelledby="gifts-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Presentes ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2
            id="gifts-title"
            className="font-heading mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          >
            Lista de presentes
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Escolha um item abaixo para presentear a Gaby no seu aniversário de 15 anos.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <GiftsGrid initialGifts={gifts} buyer={buyer} />
        </SectionReveal>
      </div>
    </section>
  )
}
