import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AdditionalInfo } from 'mercadopago/dist/clients/payment/create/types'
import prisma from '@/lib/db'
import {
  assertMercadoPagoConfigured,
  createExternalReference,
  getMercadoPagoNotificationUrl,
  getMercadoPagoPaymentClient,
  serializeMercadoPagoPayment,
  syncGiftPurchaseFromMercadoPagoPayment,
} from '@/lib/mercadopago'

const formDataSchema = z
  .object({
    token: z.string().optional(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    payment_method_id: z.string().min(1),
    payment_method_option_id: z.string().optional(),
    transaction_amount: z.coerce.number().positive(),
    installments: z.coerce.number().int().positive().optional(),
    payer: z
      .object({
        email: z.string().email(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        identification: z
          .object({
            type: z.string().min(1),
            number: z.string().min(1),
          })
          .optional(),
        address: z
          .object({
            zip_code: z.string().optional(),
            federal_unit: z.string().optional(),
            city: z.string().optional(),
            neighborhood: z.string().optional(),
            street_name: z.string().optional(),
            street_number: z.string().optional(),
          })
          .partial()
          .optional(),
      })
      .passthrough(),
    additional_info: z
      .custom<AdditionalInfo>(
        (value) => value == null || (typeof value === 'object' && !Array.isArray(value)),
        'additional_info invalido'
      )
      .optional(),
  })
  .passthrough()

const schema = z.object({
  invitationCode: z.string().min(4).max(32),
  selectedPaymentMethod: z.string().min(1),
  paymentType: z.string().optional(),
  formData: formDataSchema,
})

const mercadopagoErrorMessages: Record<string, string> = {
  MERCADO_PAGO_ACCESS_TOKEN_MISSING: 'Configure o access token do Mercado Pago.',
  MERCADO_PAGO_PUBLIC_KEY_MISSING: 'Configure a public key do Mercado Pago.',
  APP_URL_MISSING: 'Configure NEXT_PUBLIC_APP_URL para receber os webhooks.',
}

function getMercadoPagoCheckoutError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  const maybeError = error as {
    message?: string
    status?: number
    error?: string
    cause?: Array<{ description?: string }>
  }

  const message = maybeError.message?.trim() ?? ''
  const causeMessage = maybeError.cause?.[0]?.description?.trim() ?? ''
  const joinedMessage = `${message} ${causeMessage}`.trim().toLowerCase()

  if (joinedMessage.includes('collector user without key enabled for qr render')) {
    return {
      status: 400,
      error:
        'A conta do Mercado Pago usada neste projeto ainda nao possui uma chave PIX habilitada para gerar QR Code. Ative uma chave PIX nessa conta e tente novamente.',
    }
  }

  if (maybeError.status && maybeError.status >= 400 && maybeError.status < 500 && message) {
    return {
      status: maybeError.status,
      error: message,
    }
  }

  return null
}

function splitGuestName(name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return {
      firstName: 'Convidado',
      lastName: 'Convite',
    }
  }

  const [firstName, ...rest] = trimmed.split(/\s+/)

  return {
    firstName,
    lastName: rest.join(' ') || 'Convite',
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo invalido.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos.', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    assertMercadoPagoConfigured()
  } catch (error) {
    const message =
      error instanceof Error ? mercadopagoErrorMessages[error.message] : null

    return NextResponse.json(
      {
        error:
          message ??
          'A integracao com Mercado Pago ainda nao foi configurada neste ambiente.',
      },
      { status: 503 }
    )
  }

  const invitationCode = parsed.data.invitationCode.toUpperCase()
  let createdPurchaseId: string | null = null

  try {
    const guest = await prisma.guest.findUnique({
      where: { invitationCode },
      select: {
        id: true,
        name: true,
        phone: true,
        invitationCode: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Codigo de convite invalido. Use o link que voce recebeu.' },
        { status: 403 }
      )
    }

    const purchaseContext = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
        },
      })

      if (!gift) {
        const err = new Error('NOT_FOUND')
        err.name = 'NOT_FOUND'
        throw err
      }

      if (gift.status === 'RESERVED') {
        const err = new Error('ALREADY_RESERVED')
        err.name = 'ALREADY_RESERVED'
        throw err
      }

      if (gift.price == null || gift.price <= 0) {
        const err = new Error('MISSING_PRICE')
        err.name = 'MISSING_PRICE'
        throw err
      }

      const externalReference = createExternalReference()
      const purchase = await tx.giftPurchase.create({
        data: {
          giftId: gift.id,
          guestId: guest.id,
          buyerName: guest.name,
          buyerPhone: guest.phone,
          invitationCode: guest.invitationCode ?? invitationCode,
          amount: gift.price,
          status: 'PENDING',
          provider: 'mercado_pago',
          externalReference,
        },
        select: {
          id: true,
          externalReference: true,
        },
      })

      return {
        gift,
        purchase,
      }
    })

    createdPurchaseId = purchaseContext.purchase.id

    const { firstName, lastName } = splitGuestName(guest.name)
    const paymentClient = getMercadoPagoPaymentClient()
    const paymentResponse = await paymentClient.create({
      body: {
        transaction_amount: purchaseContext.gift.price ?? undefined,
        description: `Presente: ${purchaseContext.gift.name}`,
        payment_method_id: parsed.data.formData.payment_method_id,
        token: parsed.data.formData.token,
        installments: parsed.data.formData.installments,
        issuer_id:
          parsed.data.formData.issuer_id != null
            ? Number(parsed.data.formData.issuer_id)
            : undefined,
        payer: {
          ...parsed.data.formData.payer,
          first_name: parsed.data.formData.payer.first_name ?? firstName,
          last_name: parsed.data.formData.payer.last_name ?? lastName,
        },
        additional_info: parsed.data.formData.additional_info,
        notification_url: getMercadoPagoNotificationUrl(),
        external_reference: purchaseContext.purchase.externalReference ?? undefined,
        metadata: {
          giftId: purchaseContext.gift.id,
          purchaseId: purchaseContext.purchase.id,
          guestId: guest.id,
          invitationCode: guest.invitationCode ?? invitationCode,
        },
      },
      requestOptions: {
        idempotencyKey: purchaseContext.purchase.id,
      },
    })

    const syncResult = await syncGiftPurchaseFromMercadoPagoPayment(paymentResponse)
    const serializedPayment = serializeMercadoPagoPayment(paymentResponse)

    return NextResponse.json({
      purchaseId: syncResult?.purchase.id ?? purchaseContext.purchase.id,
      giftId: purchaseContext.gift.id,
      giftStatus: syncResult?.giftStatus ?? purchaseContext.gift.status,
      payment: serializedPayment,
    })
  } catch (error) {
    if (createdPurchaseId) {
      await prisma.giftPurchase
        .update({
          where: { id: createdPurchaseId },
          data: {
            status: 'CANCELLED',
            statusDetail: 'payment_creation_failed',
          },
        })
        .catch(() => undefined)
    }

    if (error instanceof Error) {
      if (error.name === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Presente nao encontrado.' }, { status: 404 })
      }

      if (error.name === 'ALREADY_RESERVED') {
        return NextResponse.json({ error: 'Este presente ja foi reservado.' }, { status: 409 })
      }

      if (error.name === 'MISSING_PRICE') {
        return NextResponse.json(
          { error: 'Este presente precisa ter um valor definido antes da compra.' },
          { status: 422 }
        )
      }
    }

    const mercadoPagoError = getMercadoPagoCheckoutError(error)
    if (mercadoPagoError) {
      console.error('[POST /api/gifts/[id]/checkout][mercadopago]', error)
      return NextResponse.json(
        { error: mercadoPagoError.error },
        { status: mercadoPagoError.status }
      )
    }

    console.error('[POST /api/gifts/[id]/checkout]', error)
    return NextResponse.json(
      { error: 'Nao foi possivel iniciar o pagamento agora.' },
      { status: 500 }
    )
  }
}
