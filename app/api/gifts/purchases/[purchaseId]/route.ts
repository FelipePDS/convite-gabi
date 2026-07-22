import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const schema = z.object({
  invitationCode: z.string().min(4).max(32),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params
  const url = new URL(req.url)
  const parsed = schema.safeParse({
    invitationCode: url.searchParams.get('invitationCode') ?? '',
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Codigo de convite invalido.' }, { status: 422 })
  }

  const invitationCode = parsed.data.invitationCode.toUpperCase()

  try {
    const purchase = await prisma.giftPurchase.findFirst({
      where: {
        id: purchaseId,
        invitationCode,
      },
      select: {
        id: true,
        status: true,
        statusDetail: true,
        amount: true,
        paymentMethodId: true,
        paymentTypeId: true,
        providerPaymentId: true,
        qrCode: true,
        qrCodeBase64: true,
        paidAt: true,
        createdAt: true,
        gift: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Compra nao encontrada.' }, { status: 404 })
    }

    return NextResponse.json({
      purchase: {
        id: purchase.id,
        status: purchase.status,
        statusDetail: purchase.statusDetail,
        amount: purchase.amount,
        paymentMethodId: purchase.paymentMethodId,
        paymentTypeId: purchase.paymentTypeId,
        providerPaymentId: purchase.providerPaymentId,
        qrCode: purchase.qrCode,
        qrCodeBase64: purchase.qrCodeBase64,
        paidAt: purchase.paidAt?.toISOString() ?? null,
        createdAt: purchase.createdAt.toISOString(),
      },
      gift: {
        id: purchase.gift.id,
        status: purchase.gift.status,
      },
    })
  } catch (error) {
    console.error('[GET /api/gifts/purchases/[purchaseId]]', error)
    return NextResponse.json({ error: 'Erro ao consultar a compra.' }, { status: 500 })
  }
}
