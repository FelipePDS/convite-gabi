import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(['AVAILABLE', 'RESERVED']).optional(),
})

async function auth() {
  return getServerSession(authOptions)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 422 })

  try {
    const gift = await prisma.gift.update({
      where: { id },
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
        description: parsed.data.description || null,
        // Reset reservation when marking as AVAILABLE
        ...(parsed.data.status === 'AVAILABLE' && {
          reservedByName: null,
          reservedByPhone: null,
          reservedAt: null,
        }),
      },
    })
    return NextResponse.json(gift)
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await prisma.gift.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}
