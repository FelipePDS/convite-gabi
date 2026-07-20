'use client'

import { SectionReveal } from './SectionReveal'
import type { EventData } from '@/services/event'

interface AboutSectionProps {
  event: Pick<EventData, 'description'>
  youtubeId?: string // optional YouTube video ID
}

export function AboutSection({ event, youtubeId }: AboutSectionProps) {
  return (
    <section
      id="sobre"
      className="bg-background py-24 md:py-32"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Section label */}
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ A celebração ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2
            id="about-title"
            className="font-heading mb-10 max-w-xl text-4xl font-bold leading-snug tracking-tight md:text-5xl"
          >
            Uma noite para lembrar para sempre
          </h2>
        </SectionReveal>

        <div className={`grid gap-12 ${youtubeId ? 'lg:grid-cols-2 lg:items-start' : ''}`}>
          {/* Text */}
          <SectionReveal delay={0.15}>
            <div className="prose prose-neutral dark:prose-invert max-w-prose text-lg leading-relaxed">
              {event.description ? (
                event.description
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph, i) => <p key={i}>{paragraph}</p>)
              ) : (
                <p className="text-muted-foreground">
                  Venha celebrar conosco este momento especial. Será uma noite de muita alegria,
                  música e momentos inesquecíveis ao lado das pessoas que mais amamos.
                </p>
              )}
            </div>
          </SectionReveal>

          {/* YouTube embed */}
          {youtubeId && (
            <SectionReveal delay={0.25} direction="left">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <div className="relative pt-[56.25%]">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="Vídeo da celebração"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </SectionReveal>
          )}
        </div>
      </div>
    </section>
  )
}
