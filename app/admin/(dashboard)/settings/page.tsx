import prisma from '@/lib/db'
import { SettingsForm } from '@/components/admin/SettingsForm'

function toDatetimeLocal(date: Date) {
  // Format: YYYY-MM-DDTHH:mm (required by datetime-local input)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

async function getSettings() {
  try {
    return await prisma.eventSettings.findUnique({ where: { id: 1 } })
  } catch {
    return null
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  const initial = settings
    ? {
        title: settings.title,
        description: settings.description ?? '',
        eventDate: toDatetimeLocal(settings.eventDate),
        venueName: settings.venueName ?? '',
        address: settings.address,
        mapsUrl: settings.mapsUrl ?? '',
        parking: settings.parking ?? '',
        dressCode: settings.dressCode ?? '',
        contact: settings.contact ?? '',
        pixKey: settings.pixKey ?? '',
        qrCodeUrl: settings.qrCodeUrl ?? '',
      }
    : {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Configurações do evento</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edite as informações que aparecem no site público
        </p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  )
}
