import prisma from '@/lib/db'

export type GuestInviteData = {
  id: string
  name: string
  phone: string | null
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED'
  invitationCode: string
  guestCount: number
  companionNames: string[]
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
      select: { name: true },
    })

    return {
      id: guest.id,
      name: guest.name,
      phone: guest.phone ?? null,
      guestCount: guest.guestCount,
      companionNames: companions.map((companion) => companion.name),
      status: guest.status as 'PENDING' | 'CONFIRMED' | 'DECLINED',
      invitationCode: guest.invitationCode!,
      viewedAt: guest.viewedAt?.toISOString() ?? null,
      confirmedAt: guest.confirmedAt?.toISOString() ?? null,
    }
  } catch {
    return null
  }
}

/** Update viewedAt only on first view — non-critical, never throws */
export async function trackInviteView(guestId: string): Promise<void> {
  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: { viewedAt: new Date() },
    })
  } catch {
    // Silently ignore — tracking is best-effort
  }
}
