import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env.local first (Next.js convention), then fall back to .env
dotenv.config({ path: '.env.local', override: true })
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
})
