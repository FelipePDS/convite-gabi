import { SectionReveal } from './SectionReveal'
import { GiftsGrid, type GiftBuyer } from './GiftsGrid'
import { getGifts } from '@/services/gifts'

interface GiftsSectionProps {
  buyer?: GiftBuyer | null
}

export async function GiftsSection({ buyer = null }: GiftsSectionProps = {}) {
  const gifts = await getGifts(buyer?.invitationCode)

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

        <div className="mb-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,420px)] lg:gap-12">
          <div>
            <SectionReveal delay={0.1}>
              <h2
                id="gifts-title"
                className="font-heading mb-5 text-4xl font-bold tracking-tight md:text-5xl"
              >
                Lista de presentes
              </h2>
            </SectionReveal>

            <SectionReveal delay={0.15}>
              <div className="text-muted-foreground max-w-3xl space-y-4 text-base leading-7 md:text-lg">
                <p>
                  Ter você ao meu lado neste dia tão sonhado será, sem dúvida, o
                  maior presente que eu poderia receber. Sua presença tornará esse
                  momento ainda mais especial e inesquecível para mim.
                </p>
                <p>
                  Se, além de celebrar comigo, você desejar me presentear,
                  preparei com carinho uma lista de presentes para facilitar sua
                  escolha. Mas saiba que o verdadeiro presente será compartilhar
                  essa data tão importante com as pessoas que fazem parte da minha vida.
                </p>
                <p>
                  Com muito carinho, espero por você para comemorarmos juntos os
                  meus 15 anos!
                </p>
              </div>
            </SectionReveal>
          </div>

          <SectionReveal delay={0.2}>
            <div className="mx-auto flex w-full max-w-[420px] justify-center">
              <img
                src="/images/capa-presente-1.png"
                alt="Gabriela com as mãos em formato de coração"
                width={800}
                height={1200}
                className="h-auto w-full rounded-[2rem] object-contain dark:hidden"
              />
              <img
                src="/images/capa-presente-2.png"
                alt="Gabriela com as mãos em formato de coração"
                width={800}
                height={1200}
                className="hidden h-auto w-full rounded-[2rem] object-contain dark:block"
              />
            </div>
          </SectionReveal>
        </div>

        <SectionReveal delay={0.25}>
          <GiftsGrid initialGifts={gifts} buyer={buyer} />
        </SectionReveal>
      </div>
    </section>
  )
}
