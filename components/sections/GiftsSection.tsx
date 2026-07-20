import { SectionReveal } from './SectionReveal'
import { GiftsGrid } from './GiftsGrid'
import { getGifts } from '@/services/gifts'

export async function GiftsSection() {
  const gifts = await getGifts()

  return (
    <section
      id="presentes"
      className="bg-muted/30 py-24 md:py-32"
      aria-labelledby="gifts-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Heading */}
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Lista de presentes ✦
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
          <p className="text-muted-foreground mb-12 max-w-lg">
            Se quiser presentear, escolha um item abaixo e reserve seu nome.
            O presente pode ser entregue no dia do evento ou combinado separadamente.
          </p>
        </SectionReveal>

        {/* Grid */}
        <SectionReveal delay={0.2}>
          <GiftsGrid initialGifts={gifts} />
        </SectionReveal>
      </div>
    </section>
  )
}
