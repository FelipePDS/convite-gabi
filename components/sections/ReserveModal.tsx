'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { reserveGiftSchema, type ReserveGiftData } from '@/lib/validations/gift'
import type { GiftData } from '@/services/gifts'

interface ReserveModalProps {
  gift: GiftData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (giftId: string) => void
  invitationCode?: string
}

export function ReserveModal({
  gift,
  open,
  onOpenChange,
  onSuccess,
  invitationCode,
}: ReserveModalProps) {
  const [succeeded, setSucceeded] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReserveGiftData>({
    resolver: zodResolver(reserveGiftSchema),
    defaultValues: { invitationCode: invitationCode ?? '' },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ invitationCode: invitationCode ?? '' })
      setSucceeded(false)
    }

    onOpenChange(next)
  }

  const onSubmit = async (data: ReserveGiftData) => {
    if (!gift) return

    const res = await fetch(`/api/gifts/${gift.id}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json().catch(() => ({}))

    if (res.status === 409) {
      setError('root', { message: 'Este presente já foi reservado por outra pessoa.' })
      return
    }

    if (!res.ok) {
      setError('root', { message: json.error ?? 'Erro ao reservar. Tente novamente.' })
      return
    }

    setSucceeded(true)
    onSuccess(gift.id)

    window.setTimeout(() => handleOpenChange(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {succeeded ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">Presente reservado!</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Obrigado por reservar <strong>{gift?.name}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reservar presente</DialogTitle>
              <DialogDescription>
                {gift?.name} - informe o código do convite para reservar.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reserve-code">
                  Código de convite *
                  {invitationCode && (
                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                      (preenchido)
                    </span>
                  )}
                </Label>
                <Input
                  id="reserve-code"
                  placeholder="Ex: A1B2C3D4"
                  aria-invalid={!!errors.invitationCode}
                  readOnly={!!invitationCode}
                  className={
                    invitationCode
                      ? 'bg-muted font-mono text-sm'
                      : 'font-mono text-sm uppercase'
                  }
                  {...register('invitationCode')}
                />
                {errors.invitationCode && (
                  <p className="text-destructive text-xs">
                    {errors.invitationCode.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <p
                  role="alert"
                  className="bg-destructive/10 text-destructive rounded-xl px-4 py-2 text-sm"
                >
                  {errors.root.message}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reservando...
                    </>
                  ) : (
                    'Reservar'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
