import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const apiSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  attending: z.enum(['CONFIRMED', 'DECLINED']),
  companionAttendance: z
    .array(
      z.object({
        id: z.string().min(1),
        status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
      })
    )
    .max(19)
    .optional(),
  message: z.string().max(500).optional(),
  invitationCode: z.string().optional(),
})

type CompanionStatus = 'CONFIRMED' | 'DECLINED' | 'PENDING'

function normalizeCompanionAttendance(
  companions: { id: string; status: CompanionStatus }[] | undefined
) {
  const unique = new Map<string, CompanionStatus>()

  for (const companion of companions ?? []) {
    unique.set(companion.id, companion.status)
  }

  return [...unique.entries()].map(([id, status]) => ({ id, status }))
}

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

  const companionAttendance = normalizeCompanionAttendance(parsed.data.companionAttendance)
  const invitationCode = parsed.data.invitationCode?.toUpperCase()

  try {
    const response = await prisma.$transaction(async (tx) => {
      const baseData = {
        name: parsed.data.name,
        phone: parsed.data.phone,
        message: parsed.data.message ?? null,
        status: parsed.data.attending,
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
            data: {
              ...baseData,
            },
          })
        } else {
          const created = await tx.guest.create({
            data: {
              ...baseData,
              guestCount: 1,
              invitationCode,
            },
            select: { id: true },
          })
          guestId = created.id
        }
      } else {
        const created = await tx.guest.create({
          data: {
            ...baseData,
            guestCount: 1,
          },
          select: { id: true },
        })
        guestId = created.id
      }

      const existingCompanions = await tx.guest.findMany({
        where: { primaryGuestId: guestId },
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' },
      })

      const validCompanionIds = new Set(existingCompanions.map((companion) => companion.id))
      const statusById = new Map(
        companionAttendance
          .filter((companion) => validCompanionIds.has(companion.id))
          .map((companion) => [companion.id, companion.status])
      )

      for (const companion of existingCompanions) {
        const status = statusById.get(companion.id) ?? 'PENDING'

        await tx.guest.update({
          where: { id: companion.id },
          data: {
            phone: parsed.data.phone,
            status,
            confirmedAt: status === 'PENDING' ? null : new Date(),
          },
        })
      }

      const confirmedCompanions = existingCompanions.filter(
        (companion) => statusById.get(companion.id) === 'CONFIRMED'
      )

      await tx.guest.update({
        where: { id: guestId },
        data: {
          guestCount: existingCompanions.length + 1,
        },
      })

      return {
        success: true,
        name: parsed.data.name,
        status: parsed.data.attending,
        companions: existingCompanions.map((companion) => ({
          id: companion.id,
          name: companion.name,
          status: statusById.get(companion.id) ?? 'PENDING',
        })),
        confirmedCompanionCount: confirmedCompanions.length,
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
