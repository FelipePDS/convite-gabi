import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  companionNames: z.array(z.object({ name: z.string().trim().min(2).max(100) })).max(19).default([]),
})

function generateCode(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
}

function normalizeCompanionNames(companions: { name: string }[]) {
  const unique = new Set<string>()

  return companions.filter((companion) => {
    const key = companion.name.trim().toLowerCase()
    if (!key || unique.has(key)) return false
    unique.add(key)
    return true
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid', details: parsed.error.flatten() }, { status: 422 })
  }

  const { name, phone } = parsed.data
  const companionNames = normalizeCompanionNames(parsed.data.companionNames)

  try {
    let invitationCode = generateCode()
    for (let i = 0; i < 5; i += 1) {
      const exists = await prisma.guest.findUnique({ where: { invitationCode } })
      if (!exists) break
      invitationCode = generateCode()
    }

    const payload = await prisma.$transaction(async (tx) => {
      const createdGuest = await tx.guest.create({
        data: {
          name,
          phone,
          guestCount: companionNames.length + 1,
          status: 'PENDING',
          invitationCode,
        },
      })

      if (companionNames.length > 0) {
        await tx.guest.createMany({
          data: companionNames.map((companion) => ({
            name: companion.name.trim(),
            phone,
            guestCount: 1,
            status: 'PENDING',
            primaryGuestId: createdGuest.id,
          })),
        })
      }

      const createdCompanions =
        companionNames.length > 0
          ? await tx.guest.findMany({
              where: { primaryGuestId: createdGuest.id },
              orderBy: { createdAt: 'asc' },
              select: { id: true, name: true, status: true, createdAt: true },
            })
          : []

      return {
        guest: createdGuest,
        companions: createdCompanions,
      }
    })

    return NextResponse.json(
      {
        ...payload.guest,
        guestCount: companionNames.length + 1,
        companions: payload.companions.map((companion) => ({
          id: companion.id,
          name: companion.name,
          status: companion.status,
          createdAt: companion.createdAt.toISOString(),
        })),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/admin/guests]', error)
    return NextResponse.json(
      { error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local e execute npm run db:migrate.' },
      { status: 503 }
    )
  }
}
