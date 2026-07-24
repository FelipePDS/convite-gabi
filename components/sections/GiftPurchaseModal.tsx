'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CardPayment, Payment, initMercadoPago } from '@mercadopago/sdk-react'
import type { ICardPaymentFormData } from '@mercadopago/sdk-react/esm/bricks/cardPayment/type'
import type { IPaymentFormData } from '@mercadopago/sdk-react/esm/bricks/payment/type'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  Loader2,
  Link2,
  QrCode,
  Undo2,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { safeJson } from '@/lib/safe-json'
import QRCode from 'react-qr-code'
import type { GiftData } from '@/services/gifts'
import type { GiftBuyer } from './GiftsGrid'

const mercadopagoPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? null

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

type PaymentStatus = 'PENDING' | 'IN_PROCESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
type CheckoutStep = 'form' | 'pix' | 'pending' | 'success'
type CheckoutMethodTab = 'card' | 'pix'
type CheckoutFlow = 'online' | 'manual'
type SuccessMode = 'payment' | 'reservation' | 'unreserve'

type CheckoutResponse = {
  purchaseId: string
  giftId: string
  giftStatus: 'AVAILABLE' | 'RESERVED'
  payment: {
    paymentId: string | null
    status: PaymentStatus
    rawStatus: string | null
    statusDetail: string | null
    paymentMethodId: string | null
    paymentTypeId: string | null
    amount: number | null
    paidAt: string | null
    qrCode: string | null
    qrCodeBase64: string | null
    ticketUrl: string | null
  }
}

type PurchaseStatusResponse = {
  purchase: {
    id: string
    status: PaymentStatus
    statusDetail: string | null
    amount: number | null
    paymentMethodId: string | null
    paymentTypeId: string | null
    providerPaymentId: string | null
    qrCode: string | null
    qrCodeBase64: string | null
    paidAt: string | null
    createdAt: string
  }
  gift: {
    id: string
    status: 'AVAILABLE' | 'RESERVED'
  }
}

interface GiftPurchaseModalProps {
  gift: GiftData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (giftId: string, updates?: Partial<GiftData>) => void
  buyer?: GiftBuyer | null
}

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Aguardando pagamento',
  IN_PROCESS: 'Pagamento em analise',
  APPROVED: 'Pagamento aprovado',
  REJECTED: 'Pagamento recusado',
  CANCELLED: 'Pagamento cancelado',
  REFUNDED: 'Pagamento devolvido',
}

function buildStatusMessage(status: PaymentStatus, giftName: string) {
  switch (status) {
    case 'APPROVED':
      return `O pagamento do presente ${giftName} foi confirmado e a reserva ja foi registrada.`
    case 'IN_PROCESS':
      return 'O pagamento foi recebido e esta em analise. A reserva sera confirmada assim que o provedor aprovar.'
    case 'PENDING':
      return 'Finalize o pagamento para que o presente seja reservado automaticamente.'
    case 'REJECTED':
      return 'O pagamento foi recusado. Voce pode tentar novamente com outro cartao.'
    case 'CANCELLED':
      return 'O pagamento foi cancelado antes da confirmacao.'
    case 'REFUNDED':
      return 'O pagamento foi estornado pelo provedor.'
    default:
      return 'Acompanhe o andamento do pagamento nesta tela.'
  }
}

function isPendingStatus(status: PaymentStatus) {
  return status === 'PENDING' || status === 'IN_PROCESS'
}

function isTerminalFailure(status: PaymentStatus) {
  return status === 'REJECTED' || status === 'CANCELLED' || status === 'REFUNDED'
}

function isPixPayment(data: CheckoutResponse['payment']) {
  return (
    data.paymentMethodId === 'pix' ||
    data.paymentTypeId === 'bank_transfer' ||
    Boolean(data.qrCode)
  )
}

function buildQrCodeImageSrc(base64: string | null) {
  if (!base64) return null
  return base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`
}

function showCheckoutErrorToast(message: string) {
  toast.custom(
    (currentToast) => (
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 shadow-lg">
        <div className="bg-destructive/10 text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <X className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">Nao foi possivel concluir o pagamento</p>
          <p className="text-muted-foreground text-sm leading-5">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(currentToast.id)}
          className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
          aria-label="Fechar mensagem de erro"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    {
      id: 'gift-purchase-error',
      duration: Infinity,
      position: 'top-center',
    }
  )
}

function buildBuyerEmail(buyer: GiftBuyer | null | undefined) {
  const digits = buyer?.phone?.replace(/\D/g, '') || ''
  const identifier = digits || buyer?.invitationCode?.toLowerCase() || 'convidado'
  return `${identifier}@example.com`
}

function splitBuyerName(name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  const [firstName, ...rest] = trimmed.split(/\s+/)

  return {
    firstName,
    lastName: rest.join(' '),
  }
}

function getSuccessContent(mode: SuccessMode, giftName: string) {
  switch (mode) {
    case 'reservation':
      return {
        badge: 'Reserva registrada',
        title: 'Presente reservado com sucesso!',
        description: `Voce reservou ${giftName} para comprar por fora.`,
      }
    case 'unreserve':
      return {
        badge: 'Reserva removida',
        title: 'Reserva desfeita com sucesso!',
        description: `O presente ${giftName} voltou a ficar disponivel.`,
      }
    case 'payment':
    default:
      return {
        badge: 'Pagamento aprovado',
        title: 'Presente reservado com sucesso!',
        description: `Obrigado por presentear com ${giftName}.`,
      }
  }
}

export function GiftPurchaseModal({
  gift,
  open,
  onOpenChange,
  onSuccess,
  buyer = null,
}: GiftPurchaseModalProps) {
  const [copiedPix, setCopiedPix] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('form')
  const [paymentTab, setPaymentTab] = useState<CheckoutMethodTab>('card')
  const [selectedFlow, setSelectedFlow] = useState<CheckoutFlow | null>(null)
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null)
  const [reserveSubmitting, setReserveSubmitting] = useState(false)
  const [successMode, setSuccessMode] = useState<SuccessMode>('payment')
  const hasNotifiedSuccessRef = useRef(false)

  const resetState = useCallback(() => {
    setCopiedPix(false)
    setStep('form')
    setPaymentTab('card')
    setSelectedFlow(null)
    setCheckoutResult(null)
    setReserveSubmitting(false)
    setSuccessMode('payment')
    hasNotifiedSuccessRef.current = false
  }, [])

  const handleClose = useCallback((next: boolean) => {
    if (!next) {
      resetState()
    }

    onOpenChange(next)
  }, [onOpenChange, resetState])

  useEffect(() => {
    if (mercadopagoPublicKey) {
      initMercadoPago(mercadopagoPublicKey, {
        locale: 'pt-BR',
        trackingDisabled: true,
        frontEndStack: 'react',
      })
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, open])

  useEffect(() => {
    if (!gift || !checkoutResult) return

    if (
      checkoutResult.payment.status === 'APPROVED' ||
      checkoutResult.giftStatus === 'RESERVED'
    ) {
      if (hasNotifiedSuccessRef.current) return

      hasNotifiedSuccessRef.current = true
      setSuccessMode('payment')
      setStep('success')
      onSuccess(gift.id, {
        status: 'RESERVED',
        canUndoReservation: false,
      })
    }
  }, [checkoutResult, gift, onOpenChange, onSuccess, resetState])

  useEffect(() => {
    if (!open || !gift || !buyer?.invitationCode || !checkoutResult?.purchaseId) return
    if (!isPendingStatus(checkoutResult.payment.status)) return

    let isCancelled = false

    const syncPurchaseStatus = async () => {
      const res = await fetch(
        `/api/gifts/purchases/${checkoutResult.purchaseId}?invitationCode=${encodeURIComponent(buyer.invitationCode)}`
      )
      const json = await safeJson<PurchaseStatusResponse & { error?: string }>(res)

      if (!res.ok || isCancelled) {
        return
      }

      setCheckoutResult((current) => {
        if (!current) return current

        return {
          ...current,
          giftStatus: json.gift.status,
          payment: {
            ...current.payment,
            paymentId: json.purchase.providerPaymentId,
            status: json.purchase.status,
            statusDetail: json.purchase.statusDetail,
            amount: json.purchase.amount,
            paymentMethodId: json.purchase.paymentMethodId,
            paymentTypeId: json.purchase.paymentTypeId,
            qrCode: json.purchase.qrCode,
            qrCodeBase64: json.purchase.qrCodeBase64,
            paidAt: json.purchase.paidAt,
          },
        }
      })
    }

    syncPurchaseStatus().catch(() => undefined)
    const intervalId = window.setInterval(() => {
      syncPurchaseStatus().catch(() => undefined)
    }, 5000)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [open, gift, buyer?.invitationCode, checkoutResult?.purchaseId, checkoutResult?.payment.status])

  const submitCheckout = async (submission: {
    paymentType?: string
    selectedPaymentMethod: string
    formData: unknown
  }) => {
    if (!gift || !buyer) {
      throw new Error('Compra indisponivel nesta pagina.')
    }

    const res = await fetch(`/api/gifts/${gift.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationCode: buyer.invitationCode,
        paymentType: submission.paymentType,
        selectedPaymentMethod: submission.selectedPaymentMethod,
        formData: submission.formData,
      }),
    })

    const json = await safeJson<CheckoutResponse & { error?: string }>(res)

    if (!res.ok) {
      const message = json.error ?? 'Nao foi possivel iniciar o pagamento.'
      showCheckoutErrorToast(message)
      return
    }

    setCheckoutResult(json)

    if (json.payment.status === 'APPROVED' || json.giftStatus === 'RESERVED') {
      setSuccessMode('payment')
      setStep('success')
      return
    }

    if (isTerminalFailure(json.payment.status)) {
      setStep('form')
      showCheckoutErrorToast(
        json.payment.statusDetail
          ? `Pagamento nao aprovado: ${json.payment.statusDetail}.`
          : buildStatusMessage(json.payment.status, gift.name)
      )
      return
    }

    setStep(isPixPayment(json.payment) ? 'pix' : 'pending')
  }

  const handleCardPaymentSubmit = async (
    submission: ICardPaymentFormData<{ email?: string }>
  ) => {
    return submitCheckout({
      paymentType: 'creditCard',
      selectedPaymentMethod: 'creditCard',
      formData: submission,
    })
  }

  const handlePixPaymentSubmit = async (submission: IPaymentFormData) => {
    return submitCheckout({
      paymentType: submission.paymentType,
      selectedPaymentMethod: submission.selectedPaymentMethod,
      formData: submission.formData,
    })
  }

  const handleCopyPix = async () => {
    const qrCode = checkoutResult?.payment.qrCode

    if (!qrCode) return

    try {
      await navigator.clipboard.writeText(qrCode)
      setCopiedPix(true)
      window.setTimeout(() => setCopiedPix(false), 2500)
    } catch {
      showCheckoutErrorToast('Copie o codigo PIX manualmente.')
    }
  }

  const handleManualReservation = async () => {
    if (!gift || !buyer?.invitationCode) return

    setReserveSubmitting(true)

    try {
      const res = await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationCode: buyer.invitationCode,
        }),
      })

      const json = await safeJson<{ error?: string }>(res)

      if (!res.ok) {
        showCheckoutErrorToast(json.error ?? 'Nao foi possivel reservar este presente agora.')
        return
      }

      setSuccessMode('reservation')
      setStep('success')
      onSuccess(gift.id, {
        status: 'RESERVED',
        canUndoReservation: true,
      })
    } finally {
      setReserveSubmitting(false)
    }
  }

  const handleManualUnreserve = async () => {
    if (!gift || !buyer?.invitationCode) return

    setReserveSubmitting(true)

    try {
      const res = await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationCode: buyer.invitationCode,
        }),
      })

      const json = await safeJson<{ error?: string }>(res)

      if (!res.ok) {
        showCheckoutErrorToast(json.error ?? 'Nao foi possivel remover a reserva agora.')
        return
      }

      setSuccessMode('unreserve')
      setStep('success')
      onSuccess(gift.id, {
        status: 'AVAILABLE',
        canUndoReservation: false,
      })
    } finally {
      setReserveSubmitting(false)
    }
  }

  if (!gift || !open) return null

  const canPurchase = Boolean(buyer?.invitationCode)
  const hasPrice = gift.price != null && gift.price > 0
  const canUseOnlineCheckout = canPurchase && hasPrice && Boolean(mercadopagoPublicKey)
  const canUseExternalLink = canPurchase && Boolean(gift.purchaseUrl)
  const canManageManualFlow = canUseExternalLink || gift.canUndoReservation
  const successContent = getSuccessContent(successMode, gift.name)
  const qrCodeImageSrc = buildQrCodeImageSrc(checkoutResult?.payment.qrCodeBase64 ?? null)
  const buyerName = buyer ? splitBuyerName(buyer.name) : null

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-hidden
        onClick={() => handleClose(false)}
      />

      <div className="relative h-dvh w-screen sm:flex sm:min-h-full sm:items-center sm:justify-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-purchase-title"
          className="relative flex h-full w-full flex-col bg-popover text-popover-foreground sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-xl sm:ring-1 sm:ring-foreground/10"
        >
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="text-muted-foreground hover:text-foreground absolute top-3 right-3 z-10 rounded-full p-2 transition-colors"
            aria-label="Fechar modal de presente"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-5">
            <div className="mb-3 pr-12">
              <h2 id="gift-purchase-title" className="font-heading text-base font-medium">
                {gift.name}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {gift.price != null
                  ? `Escolha entre pagar com cartao, PIX ou abrir o link do presente para comprar por fora.`
                  : 'Use o link do presente para comprar por fora e depois reserve este item.'}
              </p>
            </div>

            <div className="space-y-5">
              <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Valor do presente</p>
                  <p className="text-muted-foreground text-xs">
                    Cartao, PIX ou reserva manual pelo link.
                  </p>
                </div>
                <span className="font-heading text-primary text-xl font-bold">
                  {gift.price != null ? formatBRL(gift.price) : 'A combinar'}
                </span>
              </div>

              {!canPurchase && (
                <div className="bg-muted/60 space-y-1 rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium">Compra indisponivel nesta pagina</p>
                  <p className="text-muted-foreground text-sm">
                    Para registrar compra ou reserva, abra o seu link individual de convite.
                  </p>
                </div>
              )}

              {step === 'success' ? (
                <div className="space-y-5 py-4">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">{successContent.badge}</Badge>
                      <p className="font-heading text-lg font-semibold">{successContent.title}</p>
                      <p className="text-muted-foreground text-sm">{successContent.description}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleClose(false)}
                  >
                    Fechar
                  </Button>
                </div>
              ) : step === 'pix' && checkoutResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="text-primary h-4 w-4" />
                    <p className="text-sm font-medium">PIX gerado</p>
                  </div>

                  <div className="flex flex-col items-center gap-3 rounded-2xl border bg-white px-4 py-5">
                    {qrCodeImageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCodeImageSrc}
                        alt="QR Code do PIX"
                        className="h-48 w-48 max-w-full rounded-xl object-contain"
                      />
                    ) : checkoutResult.payment.qrCode ? (
                      <QRCode
                        value={checkoutResult.payment.qrCode}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#111111"
                        level="M"
                      />
                    ) : (
                      <div className="bg-muted flex h-48 w-48 items-center justify-center rounded-xl">
                        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                      </div>
                    )}

                    <Badge variant="secondary">{statusLabel[checkoutResult.payment.status]}</Badge>
                  </div>

                  {checkoutResult.payment.qrCode && (
                    <div className="bg-muted rounded-xl px-3 py-3">
                      <div className="flex items-start gap-2">
                        <code className="text-foreground min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-all font-mono text-[11px] leading-5 sm:text-xs">
                          {checkoutResult.payment.qrCode}
                        </code>
                        <button
                          onClick={handleCopyPix}
                          className={`shrink-0 rounded p-1 transition-colors ${
                            copiedPix
                              ? 'text-green-600'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          aria-label="Copiar codigo PIX"
                          type="button"
                        >
                          {copiedPix ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground text-center text-sm">
                    {buildStatusMessage(checkoutResult.payment.status, gift.name)}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleClose(false)}
                  >
                    Fechar
                  </Button>
                </div>
              ) : step === 'pending' && checkoutResult ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>

                  <div className="space-y-2">
                    <Badge variant="secondary">{statusLabel[checkoutResult.payment.status]}</Badge>
                    <p className="font-heading text-lg font-semibold">Aguardando confirmacao</p>
                    <p className="text-muted-foreground text-sm">
                      {buildStatusMessage(checkoutResult.payment.status, gift.name)}
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-2xl px-4 py-3 text-left">
                    <p className="text-sm font-medium">Resumo da transacao</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Metodo: {checkoutResult.payment.paymentMethodId ?? 'Nao informado'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Valor:{' '}
                      {checkoutResult.payment.amount != null
                        ? formatBRL(checkoutResult.payment.amount)
                        : 'A combinar'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleClose(false)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {!selectedFlow && (canUseOnlineCheckout || canManageManualFlow) && (
                    <div className="space-y-4">
                      <div className="space-y-1 rounded-2xl border border-dashed px-4 py-4">
                        <p className="text-sm font-medium">Como voce prefere seguir?</p>
                        <p className="text-muted-foreground text-sm">
                          Escolha uma das opcoes abaixo. Se quiser garantir o presente agora, use o pagamento online. Se preferir comprar por fora ou pagar localmente, use a reserva manual.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFlow('online')
                          }}
                          disabled={!canUseOnlineCheckout}
                          className="bg-background hover:border-primary/40 flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">Presentear agora</p>
                            <p className="text-muted-foreground text-sm">
                              Pague com cartao ou PIX. A reserva do presente acontece automaticamente quando o pagamento for confirmado.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFlow('manual')
                          }}
                          disabled={!canManageManualFlow}
                          className="bg-background hover:border-primary/40 flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            <Wallet className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">Pagar localmente ou comprar por fora</p>
                            <p className="text-muted-foreground text-sm">
                              Abra o link do presente, compre fora do site e use a reserva para avisar que esse item ficou com voce.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFlow === 'online' && canUseOnlineCheckout && (
                    <div className="space-y-4 rounded-2xl border px-3 py-4 sm:px-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="text-primary h-4 w-4" />
                            <p className="text-sm font-medium">Presentear agora</p>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Escolha cartao ou PIX. O presente sera reservado automaticamente quando o pagamento for confirmado.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 gap-1"
                          onClick={() => {
                            setSelectedFlow(null)
                          }}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Voltar
                        </Button>
                      </div>

                      <div className="bg-background inline-flex w-full items-center gap-1 rounded-full border p-1">
                        <button
                          type="button"
                          onClick={() => setPaymentTab('card')}
                          className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            paymentTab === 'card'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Cartao
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab('pix')}
                          className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            paymentTab === 'pix'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          PIX
                        </button>
                      </div>

                      {paymentTab === 'card' ? (
                        <CardPayment
                          key={`${gift.id}-mercadopago-card`}
                          initialization={{
                            amount: gift.price ?? 0,
                            payer: {
                              email: buildBuyerEmail(buyer),
                            },
                          }}
                          customization={{
                            paymentMethods: {
                              minInstallments: 1,
                              maxInstallments: 6,
                              types: {
                                included: ['credit_card'],
                              },
                            },
                            visual: {
                              hideFormTitle: true,
                            },
                          }}
                          locale="pt-BR"
                          onSubmit={handleCardPaymentSubmit}
                          onError={(brickError) => {
                            const message =
                              brickError.message || 'Erro ao carregar o checkout de cartao.'
                            showCheckoutErrorToast(message)
                          }}
                        />
                      ) : (
                        <Payment
                          key={`${gift.id}-mercadopago-pix`}
                          initialization={{
                            amount: gift.price ?? 0,
                            payer: {
                              firstName: buyerName?.firstName,
                              lastName: buyerName?.lastName || undefined,
                            },
                          }}
                          customization={{
                            paymentMethods: {
                              bankTransfer: 'all',
                              types: {
                                included: ['bank_transfer'],
                              },
                            },
                            visual: {
                              defaultPaymentOption: {
                                bankTransferForm: true,
                              },
                            },
                          }}
                          locale="pt-BR"
                          onSubmit={handlePixPaymentSubmit}
                          onError={(brickError) => {
                            const message =
                              brickError.message || 'Erro ao carregar o checkout PIX.'
                            showCheckoutErrorToast(message)
                          }}
                        />
                      )}
                    </div>
                  )}

                  {selectedFlow === 'manual' && canManageManualFlow && (
                    <div className="space-y-4 rounded-2xl border px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link2 className="text-primary h-4 w-4" />
                            <p className="text-sm font-medium">Pagar localmente ou comprar por fora</p>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Use esta opcao se voce prefere comprar fora do site e apenas registrar a reserva do presente aqui.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 gap-1"
                          onClick={() => {
                            setSelectedFlow(null)
                          }}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Voltar
                        </Button>
                      </div>

                      {gift.purchaseUrl && (
                        <a
                          href={gift.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                        >
                          Abrir link do presente
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      {gift.canUndoReservation ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handleManualUnreserve}
                          disabled={reserveSubmitting}
                        >
                          {reserveSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Undo2 className="h-4 w-4" />
                          )}
                          Tirar reserva
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-full gap-2"
                          onClick={handleManualReservation}
                          disabled={reserveSubmitting || gift.status === 'RESERVED'}
                        >
                          {reserveSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Gift className="h-4 w-4" />
                          )}
                          Reservar este presente
                        </Button>
                      )}

                      <p className="text-muted-foreground text-xs leading-5">
                        {gift.canUndoReservation
                          ? 'Esta reserva foi feita por voce. Se mudar de ideia, pode remove-la por aqui.'
                          : 'A reserva manual serve para evitar que outra pessoa escolha o mesmo presente antes de voce concluir a compra por fora.'}
                      </p>
                    </div>
                  )}

                  {canPurchase && !canUseOnlineCheckout && !gift.purchaseUrl && (
                    <div className="bg-muted/60 space-y-1 rounded-2xl px-4 py-3">
                      <p className="text-sm font-medium">Presente sem opcao configurada</p>
                      <p className="text-muted-foreground text-sm">
                        Configure um preco para pagamento com cartao ou PIX, ou cadastre um link do presente no admin.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 'form' && (
                <div className="flex pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleClose(false)}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
