import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const createPrismaClient = () => {
  // Explicit Pool with a connection timeout so unreachable DBs fail fast
  // (Prisma v7 / pg default is 0 = no timeout, which causes pages to hang)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000, // throw after 5 s if DB is unreachable
    idleTimeoutMillis: 10_000,
    max: 10,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined
}

// Prevent multiple instances in development (Next.js hot reload)
const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }
export default prisma
