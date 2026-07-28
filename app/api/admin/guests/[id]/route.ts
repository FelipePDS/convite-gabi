import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { GiftPurchaseStatus } from '@/lib/generated/prisma/enums'

const ACTIVE_PURCHASE_STATUSES = [
  GiftPurchaseStatus.PENDING,
  GiftPurchaseStatus.IN_PROCESS,
  GiftPurchaseStatus.APPROVED,
] as const

const updateCompanionsSchema = z.object({
  companions: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(2).max(100),
      })
    )
    .max(19),
})

const updateGuestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
})

function normalizeCompanions(companions: { id?: string; name: string }[]) {
  const unique = new Set<string>()

  return companions.filter((companion) => {
    const key = companion.name.trim().toLowerCase()
    if (!key || unique.has(key)) return false
    unique.add(key)
    return true
  })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateGuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
  }

  const { id } = await params

  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: {
        id: true,
        primaryGuestId: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 })
    }

    const updatedGuest = await prisma.$transaction(async (tx) => {
      const data = guest.primaryGuestId
        ? {
            name: parsed.data.name.trim(),
          }
        : {
            name: parsed.data.name.trim(),
            phone: parsed.data.phone.trim(),
          }

      const updated = await tx.guest.update({
        where: { id },
        data,
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

      if (!guest.primaryGuestId) {
        await tx.guest.updateMany({
          where: { primaryGuestId: id },
          data: {
            phone: parsed.data.phone.trim(),
          },
        })
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      guest: {
        ...updatedGuest,
        phone: updatedGuest.phone ?? '',
        message: updatedGuest.message ?? null,
        invitationCode: updatedGuest.invitationCode ?? null,
        confirmedAt: updatedGuest.confirmedAt?.toISOString() ?? null,
        viewedAt: updatedGuest.viewedAt?.toISOString() ?? null,
        createdAt: updatedGuest.createdAt.toISOString(),
        primaryGuestId: updatedGuest.primaryGuestId ?? null,
        primaryGuestName: updatedGuest.primaryGuest?.name ?? null,
      },
    })
  } catch (error) {
    console.error('[PUT /api/admin/guests/[id]]', error)
    return NextResponse.json({ error: 'Erro ao atualizar convidado.' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = updateCompanionsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
  }

  const { id } = await params
  const companions = normalizeCompanions(parsed.data.companions)

  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, phone: true, primaryGuestId: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 })
    }

    if (guest.primaryGuestId) {
      return NextResponse.json(
        { error: 'Gerencie acompanhantes apenas pelo convidado principal.' },
        { status: 422 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existingCompanions = await tx.guest.findMany({
        where: { primaryGuestId: id },
        select: { id: true, name: true, status: true, confirmedAt: true },
      })

      const existingById = new Map(existingCompanions.map((companion) => [companion.id, companion]))
      const incomingIds = new Set(companions.map((companion) => companion.id).filter(Boolean) as string[])

      for (const companion of companions) {
        if (companion.id && existingById.has(companion.id)) {
          await tx.guest.update({
            where: { id: companion.id },
            data: { name: companion.name.trim() },
          })
          continue
        }

        await tx.guest.create({
          data: {
            name: companion.name.trim(),
            phone: guest.phone,
            guestCount: 1,
            status: 'PENDING',
            primaryGuestId: id,
          },
        })
      }

      const removedCompanions = existingCompanions.filter((companion) => !incomingIds.has(companion.id))
      if (removedCompanions.length > 0) {
        await tx.guest.deleteMany({
          where: {
            id: { in: removedCompanions.map((companion) => companion.id) },
          },
        })
      }

      const refreshedCompanions = await tx.guest.findMany({
        where: { primaryGuestId: id },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, status: true, confirmedAt: true, createdAt: true },
      })

      await tx.guest.update({
        where: { id },
        data: {
          guestCount: refreshedCompanions.length + 1,
        },
      })

      return refreshedCompanions
    })

    return NextResponse.json({
      success: true,
      companions: updated.map((companion) => ({
        id: companion.id,
        name: companion.name,
        status: companion.status,
        confirmedAt: companion.confirmedAt?.toISOString() ?? null,
        createdAt: companion.createdAt.toISOString(),
      })),
      guestCount: updated.length + 1,
    })
  } catch (error) {
    console.error('[PATCH /api/admin/guests/[id]]', error)
    return NextResponse.json({ error: 'Erro ao atualizar acompanhantes.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const guest = await prisma.guest.findUnique({ where: { id } })

    if (!guest) {
      return NextResponse.json({ error: 'Convidado nao encontrado' }, { status: 404 })
    }

    const giftPurchases = await prisma.giftPurchase.findMany({
      where: { guestId: id },
      select: { giftId: true },
    })

    const giftIds = [...new Set(giftPurchases.map((purchase) => purchase.giftId))]

    await prisma.$transaction(async (tx) => {
      await tx.giftPurchase.deleteMany({
        where: { guestId: id },
      })

      for (const giftId of giftIds) {
        const hasActivePurchase = await tx.giftPurchase.findFirst({
          where: {
            giftId,
            status: {
              in: [...ACTIVE_PURCHASE_STATUSES],
            },
          },
          select: { id: true },
        })

        if (!hasActivePurchase) {
          await tx.gift.update({
            where: { id: giftId },
            data: {
              status: 'AVAILABLE',
              reservedByName: null,
              reservedByPhone: null,
              reservedAt: null,
            },
          })
        }
      }

      await tx.guest.delete({
        where: { id },
      })

      if (guest.primaryGuestId) {
        const remainingCompanions = await tx.guest.count({
          where: { primaryGuestId: guest.primaryGuestId },
        })

        await tx.guest.update({
          where: { id: guest.primaryGuestId },
          data: {
            guestCount: remainingCompanions + 1,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/guests/[id]]', error)
    return NextResponse.json({ error: 'Erro ao excluir convidado.' }, { status: 500 })
  }
}
