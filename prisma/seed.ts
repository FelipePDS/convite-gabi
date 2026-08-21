import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { reservedGiftPresets } from '../lib/gift-presets'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@convite.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword,
    },
  })

  console.log(`Admin user seeded: ${adminEmail}`)

  await prisma.eventSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Aniversario da Gabi',
      description: 'Venha celebrar conosco!',
      eventDate: new Date('2025-12-31T20:00:00.000Z'),
      address: 'Endereco do evento',
    },
  })

  console.log('Event settings seeded')

  const existingPresetGifts = await prisma.gift.findMany({
    where: {
      name: {
        in: reservedGiftPresets.map((gift) => gift.name),
      },
    },
    select: {
      name: true,
    },
  })

  const existingGiftNames = new Set(existingPresetGifts.map((gift) => gift.name))
  let createdGifts = 0

  for (const gift of reservedGiftPresets) {
    if (existingGiftNames.has(gift.name)) {
      continue
    }

    await prisma.gift.create({
      data: {
        name: gift.name,
        description: gift.description,
        imageUrl: gift.imageUrl,
        purchaseUrl: gift.purchaseUrl,
        price: gift.price,
        status: gift.status,
        reservedByName: gift.reservedByName,
        reservedByPhone: gift.reservedByPhone,
        reservedAt: new Date(gift.reservedAt),
      },
    })

    createdGifts += 1
  }

  console.log(`Gift presets seeded (${createdGifts} created)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
