import prisma from '@/lib/db'

export type GuestInviteCompanionData = {
  id: string
  name: string
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED'
  confirmedAt: string | null
}

export type GuestInviteData = {
  id: string
  name: string
  phone: string | null
  message: string | null
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED'
  invitationCode: string
  guestCount: number
  companions: GuestInviteCompanionData[]
  viewedAt: string | null
  confirmedAt: string | null
}

export async function getGuestByInviteCode(code: string): Promise<GuestInviteData | null> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { invitationCode: code },
    })

    if (!guest) return null

    const companions = await prisma.guest.findMany({
      where: { primaryGuestId: guest.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, status: true, confirmedAt: true },
    })

    return {
      id: guest.id,
      name: guest.name,
      phone: guest.phone ?? null,
      message: guest.message ?? null,
      guestCount: guest.guestCount,
      companions: companions.map((companion) => ({
        id: companion.id,
        name: companion.name,
        status: companion.status as 'PENDING' | 'CONFIRMED' | 'DECLINED',
        confirmedAt: companion.confirmedAt?.toISOString() ?? null,
      })),
      status: guest.status as 'PENDING' | 'CONFIRMED' | 'DECLINED',
      invitationCode: guest.invitationCode!,
      viewedAt: guest.viewedAt?.toISOString() ?? null,
      confirmedAt: guest.confirmedAt?.toISOString() ?? null,
    }
  } catch {
    return null
  }
}

export async function trackInviteView(guestId: string): Promise<void> {
  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: { viewedAt: new Date() },
    })
  } catch {
    // Tracking é best-effort.
  }
}
