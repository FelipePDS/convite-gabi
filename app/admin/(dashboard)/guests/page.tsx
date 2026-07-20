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
      },
    })
  } catch {
    return []
  }
}

export default async function GuestsPage() {
  const raw = await getGuests()
  const guests = raw.map((g) => ({
    ...g,
    phone: g.phone ?? '',
    message: g.message ?? null,
    invitationCode: g.invitationCode ?? null,
    confirmedAt: g.confirmedAt?.toISOString() ?? null,
    viewedAt: g.viewedAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Convidados</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {guests.length} confirmação(ões) registrada(s)
        </p>
      </div>
      <GuestsTable guests={guests} />
    </div>
  )
}
