import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

function generateCode(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    // Check if guest already has a code
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, invitationCode: true },
    })

    if (!guest) return NextResponse.json({ error: 'Convidado não encontrado' }, { status: 404 })

    // Return existing code if already set
    if (guest.invitationCode) {
      return NextResponse.json({ invitationCode: guest.invitationCode })
    }

    // Generate unique code
    let invitationCode = generateCode()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.guest.findUnique({ where: { invitationCode } })
      if (!exists) break
      invitationCode = generateCode()
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: { invitationCode },
      select: { id: true, name: true, invitationCode: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/admin/guests/[id]/invite]', error)
    return NextResponse.json(
      { error: 'Banco de dados indisponível.' },
      { status: 503 }
    )
  }
}
