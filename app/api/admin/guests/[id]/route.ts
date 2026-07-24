import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { GiftPurchaseStatus } from '@/lib/generated/prisma/enums'

const ACTIVE_PURCHASE_STATUSES = [
  GiftPurchaseStatus.PENDING,
  GiftPurchaseStatus.IN_PROCESS,
  GiftPurchaseStatus.APPROVED,
] as const

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        giftPurchases: {
          select: {
            giftId: true,
          },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 })
    }

    const giftIds = [...new Set(guest.giftPurchases.map((purchase) => purchase.giftId))]

    await prisma.$transaction(async (tx) => {
      await tx.giftPurchase.deleteMany({
        where: { guestId: id },
      })

      for (const giftId of giftIds) {
        const hasActivePurchase = await tx.giftPurchase.findFirst({
          where: {
            giftId,
            status: {
              in: [...ACTIVE_PURCHASE_STATUSES],
            },
          },
          select: { id: true },
        })

        if (!hasActivePurchase) {
          await tx.gift.update({
            where: { id: giftId },
            data: {
              status: 'AVAILABLE',
              reservedByName: null,
              reservedByPhone: null,
              reservedAt: null,
            },
          })
        }
      }

      await tx.guest.delete({
        where: { id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/guests/[id]]', error)
    return NextResponse.json({ error: 'Erro ao excluir convidado.' }, { status: 500 })
  }
}
