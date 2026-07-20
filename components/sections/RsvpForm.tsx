'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RsvpSuccess } from './RsvpSuccess'
import { rsvpSchema, type RsvpFormData } from '@/lib/validations/rsvp'

interface RsvpFormProps {
  eventDate: string
  /** Pre-filled values from a personalised invite link */
  prefill?: {
    name?: string
    phone?: string
    invitationCode: string
  }
}

export function RsvpForm({ eventDate, prefill }: RsvpFormProps) {
  const [confirmedName, setConfirmedName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: prefill?.name ?? '',
      phone: prefill?.phone ?? '',
      guestCount: 1,
      invitationCode: prefill?.invitationCode,
    },
  })

  const onSubmit = async (data: RsvpFormData) => {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (res.status === 409) {
      setError('root', { message: json.error ?? 'Este convite já foi confirmado.' })
      return
    }

    if (!res.ok) {
      setError('root', { message: json.error ?? 'Erro ao confirmar. Tente novamente.' })
      return
    }

    setConfirmedName(json.name ?? data.name)
  }

  if (confirmedName) {
    return (
      <RsvpSuccess
        guestName={confirmedName}
        eventDate={eventDate}
        onReset={
          prefill
            ? undefined // personalised link → no "confirm another" button
            : () => {
                setConfirmedName(null)
                reset()
              }
        }
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.form
        key="rsvp-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-8 shadow-xl"
      >
        <div className="space-y-1">
          <h3 className="font-heading text-xl font-bold">Confirmar presença</h3>
          <p className="text-muted-foreground text-sm">
            Preencha os campos abaixo para confirmar sua presença.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-name">Nome completo *</Label>
          <Input
            id="rsvp-name"
            placeholder="Seu nome"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-phone">WhatsApp / Telefone *</Label>
          <Input
            id="rsvp-phone"
            type="tel"
            placeholder="(11) 91234-5678"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
          {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
        </div>

        {/* Guest count */}
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-guests">Número de acompanhantes *</Label>
          <Input
            id="rsvp-guests"
            type="number"
            min={1}
            max={20}
            aria-invalid={!!errors.guestCount}
            {...register('guestCount', { valueAsNumber: true })}
          />
          {errors.guestCount && (
            <p className="text-destructive text-xs">{errors.guestCount.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label htmlFor="rsvp-message">
            Mensagem <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="rsvp-message"
            placeholder="Deixe uma mensagem carinhosa…"
            rows={3}
            maxLength={500}
            aria-invalid={!!errors.message}
            {...register('message')}
          />
          {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
        </div>

        {/* Server / root error */}
        {errors.root && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl px-4 py-2 text-sm">
            {errors.root.message}
          </p>
        )}

        {/* Hidden invitation code */}
        <input type="hidden" {...register('invitationCode')} />

        <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando…
            </>
          ) : (
            'Confirmar presença ✦'
          )}
        </Button>
      </motion.form>
    </AnimatePresence>
  )
}
