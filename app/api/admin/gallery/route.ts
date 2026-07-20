import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().min(1),
  caption: z.string().max(200).optional(),
})

async function auth() {
  return getServerSession(authOptions)
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}

export async function POST(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 422 })

  try {
    const count = await prisma.galleryItem.count()
    const item = await prisma.galleryItem.create({
      data: { ...parsed.data, caption: parsed.data.caption || null, order: count },
    })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}
