import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const apiSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  guestCount: z.coerce.number().int().min(1).max(20).optional(),
  companionNames: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(100),
      })
    )
    .max(19)
    .optional(),
  message: z.string().max(500).optional(),
  invitationCode: z.string().optional(),
})

function normalizeCompanionNames(companions: { name: string }[] | undefined) {
  const unique = new Set<string>()

  return (companions ?? []).filter((companion) => {
    const key = companion.name.trim().toLowerCase()
    if (!key || unique.has(key)) {
      return false
    }

    unique.add(key)
    return true
  })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 })
  }

  const parsed = apiSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const companionNames = normalizeCompanionNames(parsed.data.companionNames)
  const totalGuestCount = companionNames.length + 1

  if (totalGuestCount > 20) {
    return NextResponse.json(
      { error: 'Maximo de 20 pessoas por confirmacao.' },
      { status: 422 }
    )
  }

  const invitationCode = parsed.data.invitationCode?.toUpperCase()

  try {
    const response = await prisma.$transaction(async (tx) => {
      const baseData = {
        name: parsed.data.name,
        phone: parsed.data.phone,
        guestCount: totalGuestCount,
        message: parsed.data.message ?? null,
        status: 'CONFIRMED' as const,
        confirmedAt: new Date(),
        primaryGuestId: null,
      }

      let guestId: string

      if (invitationCode) {
        const existing = await tx.guest.findUnique({
          where: { invitationCode },
          select: { id: true },
        })

        if (existing) {
          guestId = existing.id
          await tx.guest.update({
            where: { id: existing.id },
            data: baseData,
          })
        } else {
          const created = await tx.guest.create({
            data: {
              ...baseData,
              invitationCode,
            },
            select: { id: true },
          })
          guestId = created.id
        }
      } else {
        const created = await tx.guest.create({
          data: baseData,
          select: { id: true },
        })
        guestId = created.id
      }

      await tx.guest.deleteMany({
        where: { primaryGuestId: guestId },
      })

      if (companionNames.length > 0) {
        await tx.guest.createMany({
          data: companionNames.map((companion) => ({
            name: companion.name.trim(),
            phone: parsed.data.phone,
            guestCount: 1,
            message: null,
            status: 'CONFIRMED',
            confirmedAt: new Date(),
            primaryGuestId: guestId,
          })),
        })
      }

      return {
        success: true,
        name: parsed.data.name,
        companionNames: companionNames.map((companion) => companion.name.trim()),
        guestCount: totalGuestCount,
      }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[RSVP]', error)
    return NextResponse.json(
      { error: 'Erro interno - tente novamente em instantes' },
      { status: 500 }
    )
  }
}
