import crypto from 'node:crypto'
import MercadoPagoConfig, {
  InvalidWebhookSignatureError,
  Payment,
  WebhookSignatureValidator,
} from 'mercadopago'
import prisma from '@/lib/db'

type MercadoPagoTransactionData = {
  qr_code?: string
  qr_code_base64?: string
  ticket_url?: string
}

export type MercadoPagoPaymentSnapshot = {
  id?: number
  external_reference?: string
  status?: string
  status_detail?: string
  payment_method_id?: string
  payment_type_id?: string
  transaction_amount?: number
  date_approved?: string
  date_created?: string
  point_of_interaction?: {
    transaction_data?: MercadoPagoTransactionData
  }
}

const MERCADO_PAGO_PROVIDER = 'mercado_pago'

let mercadoPagoConfig: MercadoPagoConfig | null = null

function getMercadoPagoAccessToken() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() || null
}

export function getMercadoPagoPublicKey() {
  return process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.trim() || null
}

export function getAppUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL
  return rawUrl?.trim().replace(/\/+$/, '') || null
}

export function isMercadoPagoConfigured() {
  return Boolean(getMercadoPagoAccessToken() && getMercadoPagoPublicKey() && getAppUrl())
}

export function assertMercadoPagoConfigured() {
  if (!getMercadoPagoAccessToken()) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN_MISSING')
  }

  if (!getMercadoPagoPublicKey()) {
    throw new Error('MERCADO_PAGO_PUBLIC_KEY_MISSING')
  }

  if (!getAppUrl()) {
    throw new Error('APP_URL_MISSING')
  }
}

export function getMercadoPagoNotificationUrl() {
  const appUrl = getAppUrl()

  if (!appUrl) {
    throw new Error('APP_URL_MISSING')
  }

  return `${appUrl}/api/webhooks/mercadopago`
}

export function createExternalReference() {
  return `gift-${crypto.randomUUID()}`
}

export function getMercadoPagoPaymentClient() {
  const accessToken = getMercadoPagoAccessToken()

  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN_MISSING')
  }

  if (!mercadoPagoConfig) {
    mercadoPagoConfig = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10_000,
      },
    })
  }

  return new Payment(mercadoPagoConfig)
}

export function validateMercadoPagoWebhook(input: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim()

  if (!secret) {
    throw new Error('MERCADO_PAGO_WEBHOOK_SECRET_MISSING')
  }

  WebhookSignatureValidator.validate({
    xSignature: input.xSignature,
    xRequestId: input.xRequestId,
    dataId: input.dataId,
    secret,
    toleranceSeconds: 300,
  })
}

function mapMercadoPagoStatus(status?: string) {
  switch (status) {
    case 'approved':
      return 'APPROVED' as const
    case 'rejected':
      return 'REJECTED' as const
    case 'cancelled':
      return 'CANCELLED' as const
    case 'refunded':
    case 'charged_back':
      return 'REFUNDED' as const
    case 'in_process':
    case 'authorized':
    case 'in_mediation':
      return 'IN_PROCESS' as const
    case 'pending':
    default:
      return 'PENDING' as const
  }
}

function parseDate(value?: string) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function serializeMercadoPagoPayment(payment: MercadoPagoPaymentSnapshot) {
  const transactionData = payment.point_of_interaction?.transaction_data

  return {
    paymentId: payment.id?.toString() ?? null,
    status: mapMercadoPagoStatus(payment.status),
    rawStatus: payment.status ?? null,
    statusDetail: payment.status_detail ?? null,
    paymentMethodId: payment.payment_method_id ?? null,
    paymentTypeId: payment.payment_type_id ?? null,
    amount: payment.transaction_amount ?? null,
    paidAt: payment.date_approved ?? null,
    qrCode: transactionData?.qr_code ?? null,
    qrCodeBase64: transactionData?.qr_code_base64 ?? null,
    ticketUrl: transactionData?.ticket_url ?? null,
  }
}

export async function syncGiftPurchaseFromMercadoPagoPayment(
  payment: MercadoPagoPaymentSnapshot,
  options?: { webhookReceivedAt?: Date | null }
) {
  const externalReference = payment.external_reference ?? null
  const providerPaymentId = payment.id?.toString() ?? null

  if (!externalReference && !providerPaymentId) {
    throw new Error('MERCADO_PAGO_PAYMENT_REFERENCE_MISSING')
  }

  const normalizedStatus = mapMercadoPagoStatus(payment.status)
  const approvedAt = parseDate(payment.date_approved) ?? new Date()
  const transactionData = payment.point_of_interaction?.transaction_data

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.giftPurchase.findFirst({
      where: {
        OR: [
          ...(externalReference ? [{ externalReference }] : []),
          ...(providerPaymentId ? [{ providerPaymentId }] : []),
        ],
      },
      include: {
        gift: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!purchase) {
      return null
    }

    const updatedPurchase = await tx.giftPurchase.update({
      where: { id: purchase.id },
      data: {
        status: normalizedStatus,
        provider: purchase.provider ?? MERCADO_PAGO_PROVIDER,
        externalReference: externalReference ?? purchase.externalReference,
        providerPaymentId: providerPaymentId ?? purchase.providerPaymentId,
        paymentMethodId: payment.payment_method_id ?? purchase.paymentMethodId,
        paymentTypeId: payment.payment_type_id ?? purchase.paymentTypeId,
        statusDetail: payment.status_detail ?? purchase.statusDetail,
        amount: payment.transaction_amount ?? purchase.amount,
        qrCode: transactionData?.qr_code ?? purchase.qrCode,
        qrCodeBase64: transactionData?.qr_code_base64 ?? purchase.qrCodeBase64,
        paidAt: normalizedStatus === 'APPROVED' ? approvedAt : purchase.paidAt,
        lastWebhookAt: options?.webhookReceivedAt ?? purchase.lastWebhookAt,
      },
      select: {
        id: true,
        status: true,
        giftId: true,
      },
    })

    if (normalizedStatus === 'APPROVED') {
      await tx.gift.updateMany({
        where: {
          id: purchase.giftId,
          status: 'AVAILABLE',
        },
        data: {
          status: 'RESERVED',
          reservedByName: purchase.buyerName,
          reservedByPhone: purchase.buyerPhone,
          reservedAt: approvedAt,
        },
      })
    }

    const gift = await tx.gift.findUnique({
      where: { id: purchase.giftId },
      select: {
        status: true,
        reservedAt: true,
      },
    })

    return {
      purchase: updatedPurchase,
      giftStatus: gift?.status ?? purchase.gift.status,
      reservedAt: gift?.reservedAt?.toISOString() ?? null,
    }
  })
}

export async function syncGiftPurchaseFromMercadoPagoPaymentId(
  paymentId: string | number,
  options?: { webhookReceivedAt?: Date | null }
) {
  const paymentClient = getMercadoPagoPaymentClient()
  const payment = await paymentClient.get({ id: paymentId })

  return syncGiftPurchaseFromMercadoPagoPayment(payment, options)
}

export function isInvalidMercadoPagoWebhookError(error: unknown) {
  return error instanceof InvalidWebhookSignatureError
}
