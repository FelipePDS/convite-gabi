import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
})

function generateCode(): string {
  // 8-char uppercase hex — collision probability negligible for small guest lists
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid', details: parsed.error.flatten() }, { status: 422 })

  const { name, phone } = parsed.data

  try {
    // Generate a unique invitation code (retry on collision)
    let invitationCode = generateCode()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.guest.findUnique({ where: { invitationCode } })
      if (!exists) break
      invitationCode = generateCode()
    }

    const guest = await prisma.guest.create({
      data: { name, phone, guestCount: 1, status: 'PENDING', invitationCode },
    })
    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/guests]', error)
    return NextResponse.json(
      { error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local e execute npm run db:migrate.' },
      { status: 503 }
    )
  }
}
