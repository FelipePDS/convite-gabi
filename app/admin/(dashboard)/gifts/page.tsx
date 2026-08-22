import prisma from '@/lib/db'
import { GiftsManager } from '@/components/admin/GiftsManager'

async function getGifts() {
  try {
    return await prisma.gift.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  } catch {
    return []
  }
}

export default async function AdminGiftsPage() {
  const raw = await getGifts()
  const gifts = raw.map((gift) => ({
    id: gift.id,
    name: gift.name,
    description: gift.description ?? null,
    imageUrl: gift.imageUrl ?? null,
    purchaseUrl: gift.purchaseUrl ?? null,
    price: gift.price ?? null,
    status: gift.status,
    reservedByName: gift.reservedByName ?? null,
    reservedByPhone: gift.reservedByPhone ?? null,
    reservedAt: gift.reservedAt?.toISOString() ?? null,
    purchases: gift.purchases.map((purchase) => ({
      id: purchase.id,
      buyerName: purchase.buyerName,
      buyerPhone: purchase.buyerPhone,
      invitationCode: purchase.invitationCode,
      amount: purchase.amount ?? null,
      status: purchase.status,
      statusDetail: purchase.statusDetail ?? null,
      provider: purchase.provider ?? null,
      providerPaymentId: purchase.providerPaymentId ?? null,
      paymentMethodId: purchase.paymentMethodId ?? null,
      paymentTypeId: purchase.paymentTypeId ?? null,
      paidAt: purchase.paidAt?.toISOString() ?? null,
      createdAt: purchase.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Presentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie os itens e acompanhe as reservas por convite.
        </p>
      </div>
      <GiftsManager initialGifts={gifts} />
    </div>
  )
}
