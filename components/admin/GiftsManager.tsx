'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, ExternalLink, Gift as GiftIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { safeJson } from '@/lib/safe-json'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type GiftPurchase = {
  id: string
  buyerName: string
  buyerPhone: string
  invitationCode: string
  amount: number | null
  status: 'PENDING' | 'IN_PROCESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
  statusDetail: string | null
  provider: string | null
  providerPaymentId: string | null
  paymentMethodId: string | null
  paymentTypeId: string | null
  paidAt: string | null
  createdAt: string
}

type Gift = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  purchaseUrl: string | null
  price: number | null
  status: 'AVAILABLE' | 'RESERVED'
  reservedByName: string | null
  reservedByPhone: string | null
  reservedAt: string | null
  purchases: GiftPurchase[]
}

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatorio').max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url('URL invalida').optional().or(z.literal('')),
  purchaseUrl: z.string().url('URL invalida').optional().or(z.literal('')),
  price: z.preprocess(
    (value) => {
      if (value === '' || value == null) return undefined
      if (typeof value === 'string') return Number(value.replace(',', '.'))
      return value
    },
    z.number().min(0, 'Valor invalido').optional()
  ),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

interface GiftsManagerProps {
  initialGifts: Gift[]
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))

function normalizeGift(payload: Partial<Gift> & {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  price?: number | null
}) {
  return {
    id: payload.id,
    name: payload.name,
    description: payload.description ?? null,
    imageUrl: payload.imageUrl ?? null,
    purchaseUrl: payload.purchaseUrl ?? null,
    price: payload.price ?? null,
    status: payload.status ?? 'AVAILABLE',
    reservedByName: payload.reservedByName ?? null,
    reservedByPhone: payload.reservedByPhone ?? null,
    reservedAt: payload.reservedAt ?? null,
    purchases: payload.purchases ?? [],
  } satisfies Gift
}

function getPurchaseBadgeVariant(
  status: GiftPurchase['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'APPROVED':
      return 'default'
    case 'REJECTED':
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive'
    case 'IN_PROCESS':
      return 'outline'
    case 'PENDING':
    default:
      return 'secondary'
  }
}

function getPurchaseLabel(status: GiftPurchase['status']) {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado'
    case 'REJECTED':
      return 'Recusado'
    case 'CANCELLED':
      return 'Cancelado'
    case 'REFUNDED':
      return 'Estornado'
    case 'IN_PROCESS':
      return 'Em analise'
    case 'PENDING':
    default:
      return 'Pendente'
  }
}

export function GiftsManager({ initialGifts }: GiftsManagerProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Gift | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [detailsGift, setDetailsGift] = useState<Gift | null>(null)
  const reservedGiftsCount = gifts.filter((gift) => gift.status === 'RESERVED').length

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '', imageUrl: '', purchaseUrl: '', price: undefined })
    setDialogOpen(true)
  }

  const openEdit = (gift: Gift) => {
    setEditing(gift)
    reset({
      name: gift.name,
      description: gift.description ?? '',
      imageUrl: gift.imageUrl ?? '',
      purchaseUrl: gift.purchaseUrl ?? '',
      price: gift.price ?? undefined,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    const url = editing ? `/api/admin/gifts/${editing.id}` : '/api/admin/gifts'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await safeJson(res)

    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao salvar')
      return
    }

    if (editing) {
      setGifts((prev) =>
        prev.map((gift) =>
          gift.id === editing.id ? { ...gift, ...normalizeGift(json) } : gift
        )
      )
      toast.success('Presente atualizado!')
    } else {
      setGifts((prev) => [normalizeGift(json), ...prev])
      toast.success('Presente criado!')
    }

    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este presente?')) return

    setDeleting(id)
    const res = await fetch(`/api/admin/gifts/${id}`, { method: 'DELETE' })
    setDeleting(null)

    if (!res.ok) {
      toast.error('Erro ao excluir')
      return
    }

    setGifts((prev) => prev.filter((gift) => gift.id !== id))
    if (detailsGift?.id === id) setDetailsGift(null)
    toast.success('Presente excluido!')
  }

  return (
    <>
      <section
        aria-label="Resumo dos presentes"
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <div className="rounded-xl border px-4 py-3">
          <p className="text-muted-foreground text-sm">Total de presentes</p>
          <p className="mt-1 text-2xl font-bold">{gifts.length}</p>
        </div>
        <div className="rounded-xl border px-4 py-3">
          <p className="text-muted-foreground text-sm">Presentes reservados</p>
          <p className="mt-1 text-2xl font-bold">{reservedGiftsCount}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo presente
        </Button>
      </section>

      <div className="mt-4 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Nome</TableHead>
              <TableHead>Preco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  <GiftIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum presente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              gifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell>
                    {gift.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
                        <GiftIcon className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{gift.name}</div>
                    {gift.description && (
                      <div className="text-muted-foreground max-w-[240px] truncate text-xs">
                        {gift.description}
                      </div>
                    )}
                    {gift.purchaseUrl && (
                      <a
                        href={gift.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary mt-1 inline-flex items-center gap-1 text-xs hover:underline"
                      >
                        Ver link do presente
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {gift.price != null ? formatBRL(gift.price) : 'A combinar'}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      <Badge variant={gift.status === 'RESERVED' ? 'default' : 'secondary'}>
                        {gift.status === 'RESERVED' ? 'Reservado' : 'Disponivel'}
                      </Badge>
                      {gift.reservedByName && (
                        <div className="text-muted-foreground text-xs">
                          por {gift.reservedByName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDetailsGift(gift)}
                        title="Ver historico de pagamentos"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(gift)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:text-destructive"
                        onClick={() => handleDelete(gift.id)}
                        disabled={deleting === gift.id}
                      >
                        {deleting === gift.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar presente' : 'Novo presente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="g-name">Nome *</Label>
              <Input id="g-name" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-desc">Descricao</Label>
              <Textarea id="g-desc" rows={2} {...register('description')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-img">URL da imagem</Label>
              <Input id="g-img" placeholder="https://..." {...register('imageUrl')} />
              {errors.imageUrl && (
                <p className="text-destructive text-xs">{errors.imageUrl.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-purchase-url">Link do presente</Label>
              <Input
                id="g-purchase-url"
                placeholder="https://loja.com/presente"
                {...register('purchaseUrl')}
              />
              {errors.purchaseUrl && (
                <p className="text-destructive text-xs">{errors.purchaseUrl.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-price">Preco</Label>
              <Input
                id="g-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="149.90"
                {...register('price')}
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsGift} onOpenChange={(open) => !open && setDetailsGift(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {detailsGift ? `Historico de pagamentos: ${detailsGift.name}` : 'Historico de pagamentos'}
            </DialogTitle>
          </DialogHeader>

          {detailsGift ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-2xl px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={detailsGift.status === 'RESERVED' ? 'default' : 'secondary'}>
                    {detailsGift.status === 'RESERVED' ? 'Reservado' : 'Disponivel'}
                  </Badge>
                  {detailsGift.reservedAt && (
                    <span className="text-muted-foreground text-xs">
                      desde {formatDateTime(detailsGift.reservedAt)}
                    </span>
                  )}
                </div>

                {detailsGift.reservedByName && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium">{detailsGift.reservedByName}</p>
                    {detailsGift.reservedByPhone && (
                      <p className="text-muted-foreground">{detailsGift.reservedByPhone}</p>
                    )}
                  </div>
                )}

                {detailsGift.purchaseUrl && (
                  <a
                    href={detailsGift.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary mt-3 inline-flex items-center gap-1 text-sm hover:underline"
                  >
                    Abrir link do presente
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {detailsGift.purchases.length ? (
                <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
                  {detailsGift.purchases.map((purchase) => (
                    <div key={purchase.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium">{purchase.buyerName}</p>
                            <p className="text-muted-foreground text-sm">{purchase.buyerPhone}</p>
                            <p className="text-muted-foreground text-xs">
                              Convite: {purchase.invitationCode}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getPurchaseBadgeVariant(purchase.status)}>
                              {getPurchaseLabel(purchase.status)}
                            </Badge>
                            {purchase.paymentMethodId && (
                              <Badge variant="outline">{purchase.paymentMethodId}</Badge>
                            )}
                          </div>

                          {purchase.statusDetail && (
                            <p className="text-muted-foreground text-xs">{purchase.statusDetail}</p>
                          )}

                          {purchase.providerPaymentId && (
                            <p className="text-muted-foreground text-xs">
                              Transacao: {purchase.providerPaymentId}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {purchase.amount != null ? formatBRL(purchase.amount) : 'A combinar'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Criado em {formatDateTime(purchase.createdAt)}
                          </p>
                          {purchase.paidAt && (
                            <p className="text-muted-foreground text-xs">
                              Pago em {formatDateTime(purchase.paidAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Ainda nao ha tentativas de pagamento para este presente.
                </p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
