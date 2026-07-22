'use client'

import { useEffect, useRef, useState } from 'react'
import { Payment, initMercadoPago } from '@mercadopago/sdk-react'
import type {
  IAdditionalCardFormData,
  IPaymentFormData,
} from '@mercadopago/sdk-react/esm/bricks/payment/type'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'
import { Check, CheckCircle2, Copy, CreditCard, Loader2, QrCode } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { safeJson } from '@/lib/safe-json'
import type { GiftData } from '@/services/gifts'
import type { GiftBuyer } from './GiftsGrid'

const mercadopagoPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? null

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

type PaymentStatus = 'PENDING' | 'IN_PROCESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'

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

type CheckoutStep = 'form' | 'pix' | 'pending' | 'success'

interface GiftPurchaseModalProps {
  gift: GiftData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (giftId: string) => void
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
      return 'O pagamento foi recusado. Voce pode tentar novamente com outro metodo.'
    case 'CANCELLED':
      return 'O pagamento foi cancelado antes da confirmacao.'
    case 'REFUNDED':
      return 'O pagamento foi estornado pelo provedor.'
    default:
      return 'Acompanhe o andamento do pagamento nesta tela.'
  }
}

function isPixPayment(data: CheckoutResponse['payment']) {
  return data.paymentMethodId === 'pix' || data.paymentTypeId === 'bank_transfer' || Boolean(data.qrCode)
}

function isPendingStatus(status: PaymentStatus) {
  return status === 'PENDING' || status === 'IN_PROCESS'
}

function isTerminalFailure(status: PaymentStatus) {
  return status === 'REJECTED' || status === 'CANCELLED' || status === 'REFUNDED'
}

function buildQrCodeImageSrc(base64: string | null) {
  if (!base64) return null
  return base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`
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

export function GiftPurchaseModal({
  gift,
  open,
  onOpenChange,
  onSuccess,
  buyer = null,
}: GiftPurchaseModalProps) {
  const [copiedPix, setCopiedPix] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('form')
  const [error, setError] = useState<string | null>(null)
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null)
  const hasNotifiedSuccessRef = useRef(false)

  useEffect(() => {
    if (mercadopagoPublicKey) {
      initMercadoPago(mercadopagoPublicKey, {
        locale: 'pt-BR',
        trackingDisabled: true,
        frontEndStack: 'react',
      })
    }
  }, [])

  const resetState = () => {
    setCopiedPix(false)
    setStep('form')
    setError(null)
    setCheckoutResult(null)
    hasNotifiedSuccessRef.current = false
  }

  const handleClose = (next: boolean) => {
    if (!next) {
      resetState()
    }

    onOpenChange(next)
  }

  useEffect(() => {
    if (!gift || !checkoutResult) return

    if (
      checkoutResult.payment.status === 'APPROVED' ||
      checkoutResult.giftStatus === 'RESERVED'
    ) {
      if (hasNotifiedSuccessRef.current) return

      hasNotifiedSuccessRef.current = true
      setStep('success')
      onSuccess(gift.id)

      window.setTimeout(() => {
        setCopiedPix(false)
        setStep('form')
        setError(null)
        setCheckoutResult(null)
        hasNotifiedSuccessRef.current = false
        onOpenChange(false)
      }, 2200)
    }
  }, [checkoutResult, gift, onOpenChange, onSuccess])

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

  const handleCopyPix = async () => {
    const qrCode = checkoutResult?.payment.qrCode

    if (!qrCode) return

    try {
      await navigator.clipboard.writeText(qrCode)
      setCopiedPix(true)
      toast.success('Codigo PIX copiado!')
      window.setTimeout(() => setCopiedPix(false), 2500)
    } catch {
      toast.error('Copie o codigo manualmente.')
    }
  }

  const handlePaymentSubmit = async (
    submission: IPaymentFormData,
    _additionalData?: IAdditionalCardFormData | null
  ) => {
    if (!gift || !buyer) {
      throw new Error('Compra indisponivel nesta pagina.')
    }

    setError(null)

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
      setError(message)
      throw new Error(message)
    }

    setCheckoutResult(json)

    if (json.payment.status === 'APPROVED' || json.giftStatus === 'RESERVED') {
      setStep('success')
      return
    }

    if (isTerminalFailure(json.payment.status)) {
      setStep('form')
      setError(
        json.payment.statusDetail
          ? `Pagamento nao aprovado: ${json.payment.statusDetail}.`
          : buildStatusMessage(json.payment.status, gift.name)
      )
      return
    }

    setStep(isPixPayment(json.payment) ? 'pix' : 'pending')
  }

  if (!gift) return null

  const canPurchase = Boolean(buyer?.invitationCode)
  const hasPrice = gift.price != null && gift.price > 0
  const qrCodeImageSrc = buildQrCodeImageSrc(checkoutResult?.payment.qrCodeBase64 ?? null)
  const buyerName = buyer ? splitBuyerName(buyer.name) : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-hidden sm:max-w-xl">
        <div className="max-h-[84vh] overflow-y-auto px-1">
          <DialogHeader>
            <DialogTitle>{gift.name}</DialogTitle>
            <DialogDescription>
              {gift.price != null
                ? `Pagamento via Mercado Pago no valor de ${formatBRL(gift.price)}.`
                : 'Defina um valor para este presente antes de liberar a compra.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-medium">Total do presente</p>
                <p className="text-muted-foreground text-xs">
                  PIX ou cartão de crédito.
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
                  Para registrar a compra, abra o seu link individual de convite.
                </p>
              </div>
            )}

            {canPurchase && !hasPrice && (
              <div className="bg-muted/60 space-y-1 rounded-2xl px-4 py-3">
                <p className="text-sm font-medium">Valor do presente nao configurado</p>
                <p className="text-muted-foreground text-sm">
                  Ajuste o preco deste item no admin para liberar o pagamento online.
                </p>
              </div>
            )}

            {canPurchase && hasPrice && !mercadopagoPublicKey && (
              <div className="bg-muted/60 space-y-1 rounded-2xl px-4 py-3">
                <p className="text-sm font-medium">Mercado Pago nao configurado</p>
                <p className="text-muted-foreground text-sm">
                  Configure a chave publica do Mercado Pago para exibir o checkout.
                </p>
              </div>
            )}

            {step === 'success' ? (
              <div className="py-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary">Pagamento aprovado</Badge>
                    <p className="font-heading text-lg font-semibold">Presente reservado com sucesso!</p>
                    <p className="text-muted-foreground text-sm">
                      Obrigado por presentear com <strong>{gift.name}</strong>.
                    </p>
                  </div>
                </div>
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
                        {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-muted-foreground text-center text-sm">
                  {buildStatusMessage(checkoutResult.payment.status, gift.name)}
                </p>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                    Fechar
                  </Button>
                </div>
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
                    Valor: {checkoutResult.payment.amount != null ? formatBRL(checkoutResult.payment.amount) : 'A combinar'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            ) : canPurchase && hasPrice && mercadopagoPublicKey ? (
              <div className="space-y-5">
                <div className="bg-muted/40 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-primary h-4 w-4" />
                    <p className="text-sm font-medium">Escolha como deseja pagar</p>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    PIX com QR Code e cartao de credito disponiveis no mesmo checkout.
                  </p>
                </div>

                <div className="rounded-2xl border px-2 py-3 sm:px-4">
                  <Payment
                    initialization={{
                      amount: gift.price ?? 0,
                      payer: {
                        firstName: buyerName?.firstName,
                        lastName: buyerName?.lastName || undefined,
                      },
                    }}
                    customization={{
                      paymentMethods: {
                        creditCard: 'all',
                        bankTransfer: 'all',
                        maxInstallments: 6,
                        types: {
                          excluded: [
                            'atm',
                            'ticket',
                            'wallet_purchase',
                            'onboarding_credits',
                            'debitCard',
                            'prepaidCard',
                          ],
                        },
                      },
                      visual: {
                        defaultPaymentOption: {
                          bankTransferForm: true,
                        },
                      },
                    }}
                    locale="pt-BR"
                    onSubmit={handlePaymentSubmit}
                    onReady={() => setError(null)}
                    onError={(brickError) => {
                      const message = brickError.message || 'Erro ao carregar o checkout.'
                      setError(message)
                    }}
                  />
                </div>
              </div>
            ) : null}

            {error && (
              <p role="alert" className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-xs">
                {error}
              </p>
            )}

            {step === 'form' && (
              <div className="flex pt-1">
                <Button type="button" variant="outline" className="w-full" onClick={() => handleClose(false)}>
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
