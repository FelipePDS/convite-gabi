import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
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
      },
    })

    return NextResponse.json(
      gifts.map((gift) => ({
        ...gift,
        purchaseUrl: gift.purchaseUrl ?? null,
        canUndoReservation: false,
      }))
    )
  } catch (error) {
    console.error('[GET /api/gifts]', error)
    return NextResponse.json({ error: 'Erro ao buscar presentes' }, { status: 500 })
  }
}
