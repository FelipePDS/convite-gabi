import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const schema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, phone } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({ where: { id } })

      if (!gift) {
        const err = new Error('NOT_FOUND')
        err.name = 'NOT_FOUND'
        throw err
      }

      if (gift.status === 'RESERVED') {
        const err = new Error('ALREADY_RESERVED')
        err.name = 'ALREADY_RESERVED'
        throw err
      }

      await tx.gift.update({
        where: { id },
        data: {
          status: 'RESERVED',
          reservedByName: name,
          reservedByPhone: phone,
          reservedAt: new Date(),
        },
      })
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ALREADY_RESERVED') {
        return NextResponse.json({ error: 'Este presente já foi reservado' }, { status: 409 })
      }
      if (error.name === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
      }
    }
    console.error('[POST /api/gifts/[id]/reserve]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
