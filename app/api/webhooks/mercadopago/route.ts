import { NextResponse } from 'next/server'
import {
  isInvalidMercadoPagoWebhookError,
  syncGiftPurchaseFromMercadoPagoPaymentId,
  validateMercadoPagoWebhook,
} from '@/lib/mercadopago'

function resolvePaymentId(requestUrl: string, body: unknown) {
  const url = new URL(requestUrl)
  const fromQuery = url.searchParams.get('data.id')

  if (fromQuery) {
    return fromQuery
  }

  const legacyQueryId = url.searchParams.get('id')
  if (legacyQueryId) {
    return legacyQueryId
  }

  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data &&
    typeof body.data === 'object' &&
    'id' in body.data &&
    (typeof body.data.id === 'string' || typeof body.data.id === 'number')
  ) {
    return String(body.data.id)
  }

  return null
}

function resolveWebhookType(requestUrl: string, body: unknown) {
  const url = new URL(requestUrl)
  const fromQuery = url.searchParams.get('type') ?? url.searchParams.get('topic')

  if (fromQuery) {
    return fromQuery
  }

  if (
    body &&
    typeof body === 'object' &&
    'type' in body &&
    typeof body.type === 'string'
  ) {
    return body.type
  }

  return null
}

export async function POST(req: Request) {
  const rawBody = await req.json().catch(() => null)
  const paymentId = resolvePaymentId(req.url, rawBody)
  const webhookType = resolveWebhookType(req.url, rawBody)
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  if (webhookType && webhookType !== 'payment') {
    return NextResponse.json({ received: true, ignored: webhookType })
  }

  if (!paymentId) {
    return NextResponse.json({ error: 'Webhook sem data.id.' }, { status: 400 })
  }

  const hasSignatureHeaders = Boolean(xSignature && xRequestId)

  if (hasSignatureHeaders) {
    try {
      validateMercadoPagoWebhook({
        xSignature,
        xRequestId,
        dataId: paymentId,
      })
    } catch (error) {
      if (isInvalidMercadoPagoWebhookError(error)) {
        return NextResponse.json({ error: 'Assinatura do webhook invalida.' }, { status: 401 })
      }

      console.error('[POST /api/webhooks/mercadopago] configuration error', error)
      return NextResponse.json(
        { error: 'Webhook do Mercado Pago nao configurado corretamente.' },
        { status: 503 }
      )
    }
  } else {
    console.warn(
      '[POST /api/webhooks/mercadopago] notification received without signature headers; processing as IPN fallback.'
    )
  }

  try {
    await syncGiftPurchaseFromMercadoPagoPaymentId(paymentId, {
      webhookReceivedAt: new Date(),
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[POST /api/webhooks/mercadopago]', error)
    return NextResponse.json(
      { error: 'Falha ao processar webhook do Mercado Pago.' },
      { status: 500 }
    )
  }
}
