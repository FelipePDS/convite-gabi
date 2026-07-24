/**
 * Run `prisma migrate deploy` only when DATABASE_URL is available.
 *
 * - First Vercel deploy: DATABASE_URL not yet set (Neon integration hasn't
 *   run yet) -> skip migrations so the build succeeds.
 * - Later deploys: DATABASE_URL is set -> run migrations normally.
 * - Advisory lock timeout (P1002): retry a few times, since Vercel/Neon can
 *   briefly contend on migrations during overlapping deployments or cold starts.
 */
const { spawnSync } = require('child_process')

const MAX_RETRIES = Number(process.env.PRISMA_MIGRATE_MAX_RETRIES ?? 3)
const RETRY_DELAY_MS = Number(process.env.PRISMA_MIGRATE_RETRY_DELAY_MS ?? 12000)

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function isAdvisoryLockTimeout(output) {
  return (
    output.includes('P1002') &&
    output.toLowerCase().includes('advisory lock')
  )
}

function runMigrations() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    console.log(
      `Running prisma migrate deploy (attempt ${attempt} of ${MAX_RETRIES})...`
    )

    const result = spawnSync('prisma', ['migrate', 'deploy'], {
      stdio: 'pipe',
      encoding: 'utf8',
      shell: true,
      env: process.env,
    })

    const stdout = result.stdout ?? ''
    const stderr = result.stderr ?? ''
    const combinedOutput = `${stdout}\n${stderr}`

    if (stdout.trim()) {
      process.stdout.write(stdout)
    }

    if (stderr.trim()) {
      process.stderr.write(stderr)
    }

    if (result.status === 0) {
      console.log('Prisma migrations applied successfully.')
      return
    }

    if (attempt < MAX_RETRIES && isAdvisoryLockTimeout(combinedOutput)) {
      console.warn(
        `Prisma migrate hit an advisory lock timeout. Retrying in ${RETRY_DELAY_MS}ms...`
      )
      sleep(RETRY_DELAY_MS)
      continue
    }

    process.exit(result.status ?? 1)
  }
}

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found -> preparing prisma migrate deploy...')
  runMigrations()
} else {
  console.warn(
    'DATABASE_URL is not set - skipping prisma migrate deploy.\n' +
      'Migrations will run automatically on the next deployment once the\n' +
      'database has been provisioned (for example via the Vercel Neon integration).'
  )
}
