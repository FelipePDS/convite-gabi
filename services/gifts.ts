import prisma from '@/lib/db'

export type GiftData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number | null
  status: 'AVAILABLE' | 'RESERVED'
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
        price: true,
        status: true,
      },
    })

    return gifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      description: gift.description ?? null,
      imageUrl: gift.imageUrl ?? null,
      price: gift.price ?? null,
      status: gift.status as 'AVAILABLE' | 'RESERVED',
    }))
  } catch {
    return []
  }
}
