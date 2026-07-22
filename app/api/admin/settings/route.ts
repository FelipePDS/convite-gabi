import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

const schema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime(),
  venueName: z.string().max(200).optional(),
  address: z.string().min(1).max(300),
  mapsUrl: z.string().url().optional().or(z.literal('')),
  parking: z.string().max(200).optional(),
  dressCode: z.string().max(100).optional(),
  contact: z.string().max(100).optional(),
  pixKey: z.string().max(100).optional(),
  qrCodeUrl: z.string().url().optional().or(z.literal('')),
})

async function auth() {
  return getServerSession(authOptions)
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 1 } })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}

export async function PUT(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid', details: parsed.error.flatten() }, { status: 422 })

  const { title, description, eventDate, venueName, address, mapsUrl, parking, dressCode, contact, pixKey, qrCodeUrl } =
    parsed.data

  try {
    const settings = await prisma.eventSettings.upsert({
      where: { id: 1 },
      update: {
        title,
        description: description || null,
        eventDate: new Date(eventDate),        venueName: venueName || null,        address,
        mapsUrl: mapsUrl || null,
        parking: parking || null,
        dressCode: dressCode || null,
        contact: contact || null,
        pixKey: pixKey || null,
        qrCodeUrl: qrCodeUrl || null,
      },
      create: {
        id: 1,
        title,
        description: description || null,
        eventDate: new Date(eventDate),        venueName: venueName || null,        address,
        mapsUrl: mapsUrl || null,
        parking: parking || null,
        dressCode: dressCode || null,
        contact: contact || null,
        pixKey: pixKey || null,
        qrCodeUrl: qrCodeUrl || null,
      },
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Banco de dados indisponível. Configure DATABASE_URL no .env.local.' }, { status: 503 })
  }
}
