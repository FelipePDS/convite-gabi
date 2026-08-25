import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const apiSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  companionAttendance: z
    .array(
      z.object({
        id: z.string().min(1),
        attending: z.boolean(),
      })
    )
    .max(19)
    .optional(),
  message: z.string().max(500).optional(),
  invitationCode: z.string().optional(),
})

function normalizeCompanionAttendance(
  companions: { id: string; attending: boolean }[] | undefined
) {
  const unique = new Map<string, boolean>()

  for (const companion of companions ?? []) {
    unique.set(companion.id, companion.attending)
  }

  return [...unique.entries()].map(([id, attending]) => ({ id, attending }))
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
      const attendanceById = new Map(
        companionAttendance
          .filter((companion) => validCompanionIds.has(companion.id))
          .map((companion) => [companion.id, companion.attending])
      )

      for (const companion of existingCompanions) {
        const attending = attendanceById.get(companion.id) ?? false

        await tx.guest.update({
          where: { id: companion.id },
          data: {
            phone: parsed.data.phone,
            status: attending ? 'CONFIRMED' : 'PENDING',
            confirmedAt: attending ? new Date() : null,
          },
        })
      }

      const confirmedCompanions = existingCompanions.filter((companion) =>
        attendanceById.get(companion.id)
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
        companions: existingCompanions.map((companion) => ({
          id: companion.id,
          name: companion.name,
          status: attendanceById.get(companion.id) ? 'CONFIRMED' : 'PENDING',
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
