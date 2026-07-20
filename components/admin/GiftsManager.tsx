'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, RotateCcw, Gift as GiftIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { safeJson } from '@/lib/safe-json'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Gift = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  purchaseLink: string | null
  status: 'AVAILABLE' | 'RESERVED'
  reservedByName: string | null
  reservedByPhone: string | null
}

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  purchaseLink: z.string().url('URL inválida').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface GiftsManagerProps {
  initialGifts: Gift[]
}

export function GiftsManager({ initialGifts }: GiftsManagerProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Gift | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '', imageUrl: '', purchaseLink: '' })
    setDialogOpen(true)
  }

  const openEdit = (gift: Gift) => {
    setEditing(gift)
    reset({
      name: gift.name,
      description: gift.description ?? '',
      imageUrl: gift.imageUrl ?? '',
      purchaseLink: gift.purchaseLink ?? '',
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
      setGifts((prev) => prev.map((g) => (g.id === editing.id ? { ...g, ...json } : g)))
      toast.success('Presente atualizado!')
    } else {
      setGifts((prev) => [json, ...prev])
      toast.success('Presente criado!')
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este presente?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/gifts/${id}`, { method: 'DELETE' })
    setDeleting(null)
    if (!res.ok) { toast.error('Erro ao excluir'); return }
    setGifts((prev) => prev.filter((g) => g.id !== id))
    toast.success('Presente excluído!')
  }

  const handleToggleAvailability = async (gift: Gift) => {
    const newStatus = gift.status === 'RESERVED' ? 'AVAILABLE' : 'RESERVED'
    const res = await fetch(`/api/admin/gifts/${gift.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) { toast.error('Erro ao atualizar'); return }
    setGifts((prev) => prev.map((g) => g.id === gift.id ? { ...g, status: newStatus, reservedByName: newStatus === 'AVAILABLE' ? null : g.reservedByName } : g))
    toast.success(newStatus === 'AVAILABLE' ? 'Marcado como disponível' : 'Marcado como reservado')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{gifts.length} presente(s)</p>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo presente
        </Button>
      </div>

      <div className="mt-4 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reservado por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                      <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                        {gift.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={gift.status === 'RESERVED' ? 'secondary' : 'outline'}>
                      {gift.status === 'RESERVED' ? 'Reservado' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {gift.reservedByName ? (
                      <span>
                        {gift.reservedByName}
                        {gift.reservedByPhone && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({gift.reservedByPhone})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleAvailability(gift)}
                        title={gift.status === 'RESERVED' ? 'Marcar disponível' : 'Marcar reservado'}
                      >
                        <RotateCcw className="h-4 w-4" />
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

      {/* Create/Edit dialog */}
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
              <Label htmlFor="g-desc">Descrição</Label>
              <Textarea id="g-desc" rows={2} {...register('description')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-img">URL da imagem</Label>
              <Input id="g-img" placeholder="https://…" {...register('imageUrl')} />
              {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-link">Link de compra</Label>
              <Input id="g-link" placeholder="https://…" {...register('purchaseLink')} />
              {errors.purchaseLink && <p className="text-destructive text-xs">{errors.purchaseLink.message}</p>}
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
    </>
  )
}
