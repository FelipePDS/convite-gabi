import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Seed admin user
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

  console.log(`✅ Admin user seeded: ${adminEmail}`)

  // Seed default event settings
  await prisma.eventSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Aniversário da Gabi',
      description: 'Venha celebrar conosco!',
      eventDate: new Date('2025-12-31T20:00:00.000Z'),
      address: 'Endereço do evento',
    },
  })

  console.log('✅ Event settings seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
