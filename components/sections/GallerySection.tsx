import { SectionReveal } from './SectionReveal'
import { GalleryGrid } from './GalleryGrid'
import { getGalleryItems } from '@/services/gallery'

export async function GallerySection() {
  const items = await getGalleryItems()

  return (
    <section
      id="galeria"
      className="bg-background py-24 md:py-32"
      aria-labelledby="gallery-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Memórias ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2
            id="gallery-title"
            className="font-heading mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          >
            Galeria
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-muted-foreground mb-12 max-w-lg">
            Momentos especiais registrados ao longo dessa jornada.
          </p>
        </SectionReveal>

        <GalleryGrid items={items} />
      </div>
    </section>
  )
}
