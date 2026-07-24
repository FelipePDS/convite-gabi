import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const schema = z.object({
  invitationCode: z.string().min(4).max(32),
})

async function findGuestByInvitationCode(invitationCode: string) {
  return prisma.guest.findUnique({
    where: { invitationCode },
    select: {
      id: true,
      name: true,
      phone: true,
      invitationCode: true,
    },
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo invalido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const invitationCode = parsed.data.invitationCode.toUpperCase()

  try {
    const guest = await findGuestByInvitationCode(invitationCode)

    if (!guest) {
      return NextResponse.json(
        { error: 'Codigo de convite invalido. Use o link que voce recebeu.' },
        { status: 403 }
      )
    }

    const purchase = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({
        where: { id },
        select: {
          id: true,
          price: true,
          status: true,
        },
      })

      if (!gift) {
        const err = new Error('NOT_FOUND')
        err.name = 'NOT_FOUND'
        throw err
      }

      if (gift.status === 'RESERVED') {
        const err = new Error('ALREADY_RESERVED')
        err.name = 'ALREADY_RESERVED'
        throw err
      }

      await tx.gift.update({
        where: { id: gift.id },
        data: {
          status: 'RESERVED',
          reservedByName: guest.name,
          reservedByPhone: guest.phone,
          reservedAt: new Date(),
        },
      })

      return tx.giftPurchase.create({
        data: {
          giftId: gift.id,
          guestId: guest.id,
          buyerName: guest.name,
          buyerPhone: guest.phone,
          invitationCode: guest.invitationCode ?? invitationCode,
          amount: gift.price ?? null,
          status: 'APPROVED',
          provider: 'manual_reservation',
          paymentMethodId: 'manual',
          statusDetail: 'reserved_manually',
          paidAt: new Date(),
        },
        select: {
          id: true,
          buyerName: true,
          amount: true,
        },
      })
    })

    return NextResponse.json({ success: true, purchase }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Presente nao encontrado' }, { status: 404 })
      }

      if (error.name === 'ALREADY_RESERVED') {
        return NextResponse.json({ error: 'Este presente ja foi reservado.' }, { status: 409 })
      }
    }

    console.error('[POST /api/gifts/[id]/reserve]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo invalido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const invitationCode = parsed.data.invitationCode.toUpperCase()

  try {
    const guest = await findGuestByInvitationCode(invitationCode)

    if (!guest) {
      return NextResponse.json(
        { error: 'Codigo de convite invalido. Use o link que voce recebeu.' },
        { status: 403 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
        },
      })

      if (!gift) {
        const err = new Error('NOT_FOUND')
        err.name = 'NOT_FOUND'
        throw err
      }

      const activeManualReservation = await tx.giftPurchase.findFirst({
        where: {
          giftId: id,
          guestId: guest.id,
          invitationCode: guest.invitationCode ?? invitationCode,
          provider: 'manual_reservation',
          status: 'APPROVED',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
        },
      })

      if (!activeManualReservation || gift.status !== 'RESERVED') {
        const err = new Error('NOT_RESERVED')
        err.name = 'NOT_RESERVED'
        throw err
      }

      await tx.giftPurchase.update({
        where: { id: activeManualReservation.id },
        data: {
          status: 'CANCELLED',
          statusDetail: 'reservation_removed',
        },
      })

      await tx.gift.update({
        where: { id: gift.id },
        data: {
          status: 'AVAILABLE',
          reservedByName: null,
          reservedByPhone: null,
          reservedAt: null,
        },
      })

      return { success: true }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Presente nao encontrado' }, { status: 404 })
      }

      if (error.name === 'NOT_RESERVED') {
        return NextResponse.json({ error: 'Este presente nao esta reservado.' }, { status: 409 })
      }
    }

    console.error('[DELETE /api/gifts/[id]/reserve]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
