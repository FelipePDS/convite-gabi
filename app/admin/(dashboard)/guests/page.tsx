import prisma from '@/lib/db'
import { GuestsTable } from '@/components/admin/GuestsTable'

async function getGuests() {
  try {
    return await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        guestCount: true,
        status: true,
        message: true,
        invitationCode: true,
        confirmedAt: true,
        viewedAt: true,
        createdAt: true,
        primaryGuestId: true,
        primaryGuest: {
          select: {
            name: true,
          },
        },
      },
    })
  } catch {
    return []
  }
}

export default async function GuestsPage() {
  const raw = await getGuests()

  const primaries = raw
    .filter((guest) => !guest.primaryGuestId)
    .map((guest) => {
      const companions = raw
        .filter((candidate) => candidate.primaryGuestId === guest.id)
        .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())

      return [guest, ...companions]
    })
    .flat()

  const orphanCompanions = raw.filter(
    (guest) => guest.primaryGuestId && !raw.some((candidate) => candidate.id === guest.primaryGuestId)
  )

  const guests = [...primaries, ...orphanCompanions].map((g) => ({
    ...g,
    phone: g.phone ?? '',
    message: g.message ?? null,
    invitationCode: g.invitationCode ?? null,
    confirmedAt: g.confirmedAt?.toISOString() ?? null,
    viewedAt: g.viewedAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    primaryGuestId: g.primaryGuestId ?? null,
    primaryGuestName: g.primaryGuest?.name ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Convidados</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {guests.length} registro(s) de convidados e acompanhantes
        </p>
      </div>
      <GuestsTable guests={guests} />
    </div>
  )
}
