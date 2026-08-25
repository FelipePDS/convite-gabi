'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircleHeart, MessagesSquare, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { GuestMessageData } from '@/services/messages'

const PREVIEW_LIMIT = 6

interface MessageWallGridProps {
  messages: GuestMessageData[]
}

function MessageCard({
  message,
  index,
  compact = false,
}: {
  message: GuestMessageData
  index: number
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.04 }}
      className="mb-3 break-inside-avoid rounded-2xl border bg-card px-5 py-4 shadow-sm"
    >
      <Quote className="text-primary/40 mb-2 h-5 w-5" />
      <p
        className={
          compact
            ? 'text-foreground/90 text-sm whitespace-pre-line'
            : 'text-foreground/90 line-clamp-6 text-sm whitespace-pre-line'
        }
      >
        {message.message}
      </p>
      <p className="text-primary mt-3 text-xs font-semibold uppercase tracking-wider">
        {message.name}
      </p>
    </motion.div>
  )
}

export function MessageWallGrid({ messages }: MessageWallGridProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)

  const previewMessages = useMemo(() => messages.slice(0, PREVIEW_LIMIT), [messages])
  const hasMoreMessages = messages.length > PREVIEW_LIMIT

  if (messages.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
        <MessageCircleHeart className="h-12 w-12 opacity-30" />
        <p className="text-sm">
          Ainda não há recados por aqui. Confirme sua presença e deixe o primeiro!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {previewMessages.map((message, index) => (
          <MessageCard key={message.id} message={message} index={index} />
        ))}
      </div>

      {hasMoreMessages && (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-6"
            onClick={() => setIsOverviewOpen(true)}
          >
            <MessagesSquare className="h-4 w-4" />
            Ver todos os recados
          </Button>
        </div>
      )}

      <Dialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-[min(1100px,calc(100%-1rem))] overflow-hidden p-0 sm:max-w-[min(1100px,calc(100%-2rem))]">
          <div className="flex max-h-[92vh] flex-col">
            <DialogHeader className="border-b px-5 pt-5 pb-4">
              <DialogTitle className="font-heading text-xl">Mural de recados</DialogTitle>
              <DialogDescription>
                {messages.length} mensagens carinhosas deixadas pelos convidados.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
                {messages.map((message, index) => (
                  <MessageCard key={`${message.id}-modal`} message={message} index={index} compact />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
