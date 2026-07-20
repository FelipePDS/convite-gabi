import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  purchaseLink: z.string().url().optional().or(z.literal('')),
})

async function auth() {
  const session = await getServerSession(authOptions)
  return session
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(gifts)
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}

export async function POST(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 422 })

  const { name, description, imageUrl, purchaseLink } = parsed.data
  try {
    const gift = await prisma.gift.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        purchaseLink: purchaseLink || null,
        status: 'AVAILABLE',
      },
    })
    return NextResponse.json(gift, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}
