import prisma from '@/lib/db'
import { GiftsManager } from '@/components/admin/GiftsManager'

async function getGifts() {
  try {
    return await prisma.gift.findMany({ orderBy: { createdAt: 'asc' } })
  } catch {
    return []
  }
}

export default async function AdminGiftsPage() {
  const raw = await getGifts()
  const gifts = raw.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description ?? null,
    imageUrl: g.imageUrl ?? null,
    purchaseLink: g.purchaseLink ?? null,
    status: g.status as 'AVAILABLE' | 'RESERVED',
    reservedByName: g.reservedByName ?? null,
    reservedByPhone: g.reservedByPhone ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Presentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">Gerencie a lista de presentes</p>
      </div>
      <GiftsManager initialGifts={gifts} />
    </div>
  )
}
