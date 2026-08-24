import prisma from '@/lib/db'

export type GuestMessageData = {
  id: string
  name: string
  message: string
  confirmedAt: string | null
}

export async function getGuestMessages(): Promise<GuestMessageData[]> {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        status: 'CONFIRMED',
        primaryGuestId: null,
        message: { not: null },
      },
      orderBy: { confirmedAt: 'desc' },
      select: { id: true, name: true, message: true, confirmedAt: true },
    })

    return guests
      .filter((guest) => guest.message && guest.message.trim().length > 0)
      .map((guest) => ({
        id: guest.id,
        name: guest.name,
        message: guest.message!.trim(),
        confirmedAt: guest.confirmedAt?.toISOString() ?? null,
      }))
  } catch {
    return []
  }
}
