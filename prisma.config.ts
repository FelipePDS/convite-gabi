import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env.local first (Next.js convention), then fall back to .env
dotenv.config({ path: '.env.local', override: true })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Only include datasource when DATABASE_URL is present.
  // `prisma generate` doesn't need a DB connection — omitting datasource
  // lets it run cleanly during postinstall without a configured database.
  // `prisma migrate deploy` will fail fast with a clear error if DATABASE_URL
  // is missing rather than the confusing "Connection url is empty" message.
  ...(databaseUrl
    ? { datasource: { url: databaseUrl } }
    : {}),
})
