/**
 * Run `prisma migrate deploy` only when DATABASE_URL is available.
 *
 * - First Vercel deploy: DATABASE_URL not yet set (Neon integration hasn't
 *   run yet) → skip migrations so the build succeeds.
 * - All subsequent deploys: DATABASE_URL is set → run migrations normally.
 */
const { execSync } = require('child_process')

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found → running prisma migrate deploy...')
  execSync('prisma migrate deploy', { stdio: 'inherit' })
} else {
  console.warn(
    'DATABASE_URL is not set — skipping prisma migrate deploy.\n' +
    'Migrations will run automatically on the next deployment once the\n' +
    'database has been provisioned (e.g. via the Vercel Neon integration).'
  )
}
