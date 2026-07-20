import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

// API-level schema — uses coerce so numbers sent as strings are accepted
const apiSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  guestCount: z.coerce.number().int().min(1).max(20),
  message: z.string().max(500).optional(),
  invitationCode: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = apiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, phone, guestCount, message, invitationCode } = parsed.data

  try {
    if (invitationCode) {
      // Look up the guest record tied to this invitation code
      const existing = await prisma.guest.findUnique({ where: { invitationCode } })

      if (existing?.status === 'CONFIRMED') {
        return NextResponse.json(
          { error: 'Este convite já foi confirmado' },
          { status: 409 }
        )
      }

      // Update existing or create new with this code
      await prisma.guest.upsert({
        where: { invitationCode },
        update: {
          name,
          phone,
          guestCount,
          message: message ?? null,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        create: {
          name,
          phone,
          guestCount,
          message: message ?? null,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          invitationCode,
        },
      })
    } else {
      // Anonymous RSVP — always create a new record
      await prisma.guest.create({
        data: {
          name,
          phone,
          guestCount,
          message: message ?? null,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, name }, { status: 201 })
  } catch (error) {
    console.error('[RSVP]', error)
    return NextResponse.json(
      { error: 'Erro interno — tente novamente em instantes' },
      { status: 500 }
    )
  }
}
