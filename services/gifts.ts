import prisma from '@/lib/db'

export type GiftData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  purchaseLink: string | null
  status: 'AVAILABLE' | 'RESERVED'
  reservedByName: string | null
}

export async function getGifts(): Promise<GiftData[]> {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        purchaseLink: true,
        status: true,
        reservedByName: true,
      },
    })

    return gifts.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? null,
      imageUrl: g.imageUrl ?? null,
      purchaseLink: g.purchaseLink ?? null,
      status: g.status as 'AVAILABLE' | 'RESERVED',
      reservedByName: g.reservedByName ?? null,
    }))
  } catch {
    return []
  }
}
