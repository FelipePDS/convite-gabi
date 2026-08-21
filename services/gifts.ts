import prisma from '@/lib/db'

export type GiftData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  purchaseUrl: string | null
  price: number | null
  status: 'AVAILABLE' | 'RESERVED'
  canUndoReservation: boolean
}

export async function getGifts(invitationCode?: string | null): Promise<GiftData[]> {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        purchaseUrl: true,
        price: true,
        status: true,
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            invitationCode: true,
            provider: true,
            status: true,
          },
        },
      },
    })

    return gifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      description: gift.description ?? null,
      imageUrl: gift.imageUrl ?? null,
      purchaseUrl: gift.purchaseUrl ?? null,
      price: gift.price ?? null,
      status: gift.status as 'AVAILABLE' | 'RESERVED',
      canUndoReservation:
        gift.status === 'RESERVED' &&
        Boolean(invitationCode) &&
        gift.purchases[0]?.invitationCode === invitationCode &&
        gift.purchases[0]?.provider === 'manual_reservation' &&
        gift.purchases[0]?.status === 'APPROVED',
    }))
  } catch {
    return []
  }
}
