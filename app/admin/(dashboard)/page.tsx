import prisma from '@/lib/db'
import { Users, UserCheck, Clock, Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

async function getStats() {
  try {
    const [total, confirmed, pending, reservedGifts, recentGuests] = await Promise.all([
      prisma.guest.count(),
      prisma.guest.count({ where: { status: 'CONFIRMED' } }),
      prisma.guest.count({ where: { status: 'PENDING' } }),
      prisma.gift.count({ where: { status: 'RESERVED' } }),
      prisma.guest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, phone: true, guestCount: true, status: true, confirmedAt: true },
      }),
    ])
    return { total, confirmed, pending, reservedGifts, recentGuests }
  } catch {
    return { total: 0, confirmed: 0, pending: 0, reservedGifts: 0, recentGuests: [] }
  }
}

export default async function AdminOverviewPage() {
  const { total, confirmed, pending, reservedGifts, recentGuests } = await getStats()

  const stats = [
    { label: 'Total de convites', value: total, icon: Users, color: 'text-blue-500' },
    { label: 'Presenças confirmadas', value: confirmed, icon: UserCheck, color: 'text-green-500' },
    { label: 'Pendentes', value: pending, icon: Clock, color: 'text-amber-500' },
    { label: 'Presentes reservados', value: reservedGifts, icon: Gift, color: 'text-primary' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Visão geral</h1>
        <p className="text-muted-foreground mt-1 text-sm">Resumo do evento</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent guests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentGuests.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Nenhuma confirmação ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Acomp.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGuests.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>{g.phone}</TableCell>
                    <TableCell>{g.guestCount}</TableCell>
                    <TableCell>
                      <Badge variant={g.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {g.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {g.confirmedAt
                        ? new Intl.DateTimeFormat('pt-BR').format(new Date(g.confirmedAt))
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
