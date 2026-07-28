'use client'

import { forwardRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RsvpSuccess } from './RsvpSuccess'
import { rsvpSchema, type RsvpFormData } from '@/lib/validations/rsvp'
import { cn } from '@/lib/utils'

const inputBase =
  'w-full border-0 border-b-2 border-border bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors duration-200 focus:border-primary aria-invalid:border-destructive'

const ElegantInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(inputBase, className)} {...props} />
))
ElegantInput.displayName = 'ElegantInput'

const ElegantTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(inputBase, 'resize-none', className)}
    {...props}
  />
))
ElegantTextarea.displayName = 'ElegantTextarea'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-destructive pt-0.5 text-xs">{error}</p>}
    </div>
  )
}

interface RsvpFormProps {
  eventDate: string
  prefill?: {
    name?: string
    phone?: string
    invitationCode: string
    companionNames?: string[]
  }
  initialConfirmedName?: string
}

type RsvpResponse = {
  success: boolean
  name: string
}

export function RsvpForm({ eventDate, prefill, initialConfirmedName }: RsvpFormProps) {
  const [confirmedName, setConfirmedName] = useState<string | null>(initialConfirmedName ?? null)
  const [showSuccess, setShowSuccess] = useState(Boolean(initialConfirmedName))

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
      companionNames: [],
      invitationCode: prefill?.invitationCode,
    },
  })

  const onSubmit = async (data: RsvpFormData) => {
    const payload = {
      ...data,
      companionNames: [],
    }

    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await res.json()) as RsvpResponse & { error?: string }

    if (!res.ok) {
      setError('root', { message: json.error ?? 'Erro ao confirmar. Tente novamente.' })
      return
    }

    setConfirmedName(json.name ?? data.name)
    setShowSuccess(true)
    window.dispatchEvent(new CustomEvent('invite-rsvp-confirmed'))
  }

  if (showSuccess && confirmedName) {
    return (
      <RsvpSuccess
        guestName={confirmedName}
        eventDate={eventDate}
        onReset={
          prefill
            ? undefined
            : () => {
                setConfirmedName(null)
                setShowSuccess(false)
                reset({
                  name: '',
                  phone: '',
                  companionNames: [],
                  invitationCode: undefined,
                })
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
        className="w-full max-w-lg space-y-6"
      >
        <Field id="rsvp-name" label="Nome completo" error={errors.name?.message}>
          <ElegantInput
            id="rsvp-name"
            placeholder="Seu nome"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field id="rsvp-phone" label="WhatsApp / Telefone" error={errors.phone?.message}>
          <ElegantInput
            id="rsvp-phone"
            type="tel"
            placeholder="(11) 91234-5678"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </Field>

        {/* Seção de acompanhantes temporariamente desativada.
        <div className="space-y-3 rounded-2xl border border-dashed px-4 py-4">
          ...
        </div>
        */}

        <Field
          id="rsvp-message"
          label={
            <>
              Mensagem <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
            </>
          }
          error={errors.message?.message}
        >
          <ElegantTextarea
            id="rsvp-message"
            placeholder="Deixe uma mensagem carinhosa..."
            rows={3}
            maxLength={500}
            aria-invalid={!!errors.message}
            {...register('message')}
          />
        </Field>

        {errors.root && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl px-4 py-2 text-sm">
            {errors.root.message}
          </p>
        )}

        <input type="hidden" {...register('invitationCode')} />

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando confirmação...
            </>
          ) : confirmedName ? (
            'Atualizar confirmação'
          ) : (
            <>✦ Confirmar presença</>
          )}
        </Button>
      </motion.form>
    </AnimatePresence>
  )
}
