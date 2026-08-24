import { SectionReveal } from './SectionReveal'
import { MessageWallGrid } from './MessageWallGrid'
import { getGuestMessages } from '@/services/messages'

export async function MessageWallSection() {
  const messages = await getGuestMessages()

  return (
    <section
      id="recados"
      className="bg-background py-24 md:py-32"
      aria-labelledby="message-wall-title"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionReveal>
          <p className="text-primary mb-3 text-xs font-medium uppercase tracking-[0.3em]">
            ✦ Carinho ✦
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2
            id="message-wall-title"
            className="font-heading mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          >
            Mural de recados
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-muted-foreground mb-12 max-w-lg">
            Mensagens carinhosas deixadas pelos convidados ao confirmar presença.
          </p>
        </SectionReveal>

        <MessageWallGrid messages={messages} />
      </div>
    </section>
  )
}
