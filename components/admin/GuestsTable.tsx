'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Check,
  Copy,
  FileSpreadsheet,
  Link2,
  Loader2,
  Pencil,
  Search,
  Share2,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type GuestStatus = 'CONFIRMED' | 'PENDING' | 'DECLINED'

type Guest = {
  id: string
  name: string
  phone: string
  guestCount: number
  status: GuestStatus
  message: string | null
  invitationCode: string | null
  confirmedAt: string | null
  viewedAt: string | null
  createdAt: string
  primaryGuestId: string | null
  primaryGuestName: string | null
}

const createSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Inclua o DDD').max(20),
  companionNames: z
    .array(
      z.object({
        name: z.string().trim().min(2, 'Nome do acompanhante deve ter pelo menos 2 caracteres').max(100),
      })
    )
    .max(19, 'Máximo de 19 acompanhantes'),
})

const manageCompanionsSchema = z.object({
  companions: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(2, 'Nome do acompanhante deve ter pelo menos 2 caracteres').max(100),
      })
    )
    .max(19, 'Máximo de 19 acompanhantes'),
})

const editGuestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Inclua o DDD').max(20),
})

type CreateData = z.infer<typeof createSchema>
type ManageCompanionsData = z.infer<typeof manageCompanionsSchema>
type EditGuestData = z.infer<typeof editGuestSchema>

type ManageTarget = {
  id: string
  name: string
}

function getGuestStatusLabel(status: GuestStatus) {
  if (status === 'CONFIRMED') return 'Confirmado'
  if (status === 'DECLINED') return 'Recusado'
  return 'Pendente'
}

function getGuestStatusTone(status: GuestStatus) {
  if (status === 'CONFIRMED') return 'default' as const
  if (status === 'DECLINED') return 'destructive' as const
  return 'secondary' as const
}

function formatDate(date: string | null, includeTime = false) {
  if (!date) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(date))
}

function sortGuests(guests: Guest[]) {
  const primaryGuests = guests.filter((guest) => !guest.primaryGuestId)
  const companions = guests.filter((guest) => guest.primaryGuestId)

  const orderedPrimaries = [...primaryGuests].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )

  const grouped = orderedPrimaries.flatMap((guest) => {
    const guestCompanions = companions
      .filter((candidate) => candidate.primaryGuestId === guest.id)
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())

    return [guest, ...guestCompanions]
  })

  const orphanCompanions = companions.filter(
    (guest) => !primaryGuests.some((candidate) => candidate.id === guest.primaryGuestId)
  )

  return [...grouped, ...orphanCompanions]
}

async function exportGuestsSpreadsheet(guests: Guest[]) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Convidados', {
    views: [{ state: 'frozen', ySplit: 3 }],
  })

  workbook.creator = 'Convite Gabi'
  workbook.created = new Date()

  const exportDate = new Date()
  const filenameDate = exportDate.toISOString().slice(0, 10)

  worksheet.mergeCells('A1:J1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = 'Lista de convidados'
  titleCell.font = {
    name: 'Segoe UI',
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7C3AED' },
  }

  worksheet.mergeCells('A2:J2')
  const subtitleCell = worksheet.getCell('A2')
  subtitleCell.value = `Exportado em ${formatDate(exportDate.toISOString(), true)} - ${guests.length} convidado(s)`
  subtitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF475569' } }
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' }

  worksheet.columns = [
    { key: 'name', width: 28 },
    { key: 'type', width: 16 },
    { key: 'linkedTo', width: 24 },
    { key: 'phone', width: 18 },
    { key: 'guestCount', width: 18 },
    { key: 'status', width: 15 },
    { key: 'message', width: 34 },
    { key: 'invitationCode', width: 22 },
    { key: 'viewedAt', width: 20 },
    { key: 'confirmedAt', width: 20 },
  ]

  const headerRow = worksheet.getRow(3)
  headerRow.values = [
    'Nome',
    'Tipo',
    'Vinculado a',
    'Telefone',
    'Pessoas no convite',
    'Status',
    'Mensagem',
    'Codigo do convite',
    'Visualizado em',
    'Confirmado em',
  ]
  headerRow.height = 24
  headerRow.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  }

  for (const guest of guests) {
    const row = worksheet.addRow({
      name: guest.name,
      type: guest.primaryGuestId ? 'Acompanhante' : 'Principal',
      linkedTo: guest.primaryGuestName ?? '-',
      phone: guest.phone,
      guestCount: guest.guestCount,
      status: getGuestStatusLabel(guest.status),
      message: guest.message ?? '-',
      invitationCode: guest.invitationCode ?? '-',
      viewedAt: guest.viewedAt ? new Date(guest.viewedAt) : null,
      confirmedAt: guest.confirmedAt ? new Date(guest.confirmedAt) : null,
    })

    row.height = 22

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF111827' } }
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 5 ? 'center' : 'left',
        wrapText: colNumber === 7,
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      }
    })

    const backgroundColor = guest.primaryGuestId ? 'FFF8FAFC' : 'FFFFFFFF'
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: backgroundColor },
      }
    })

    const statusCell = row.getCell(6)
    const statusFill =
      guest.status === 'CONFIRMED'
        ? 'FFDCFCE7'
        : guest.status === 'DECLINED'
          ? 'FFFEE2E2'
          : 'FFFEF3C7'
    const statusFont =
      guest.status === 'CONFIRMED'
        ? 'FF166534'
        : guest.status === 'DECLINED'
          ? 'FF991B1B'
          : 'FF92400E'

    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusFill },
    }
    statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFont } }
    statusCell.alignment = { vertical: 'middle', horizontal: 'center' }

    for (const index of [9, 10]) {
      const dateCell = row.getCell(index)
      if (dateCell.value instanceof Date) {
        dateCell.numFmt = 'dd/mm/yyyy hh:mm'
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' }
      } else {
        dateCell.value = '-'
        dateCell.alignment = { vertical: 'middle', horizontal: 'center' }
      }
    }
  }

  worksheet.autoFilter = {
    from: 'A3',
    to: 'J3',
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `convidados-${filenameDate}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}

function ShareInviteModal({
  open,
  onClose,
  guest,
}: {
  open: boolean
  onClose: () => void
  guest: { name: string; invitationCode: string } | null
}) {
  const [copied, setCopied] = useState(false)

  if (!guest) return null

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invite/${guest.invitationCode}`
      : `/invite/${guest.invitationCode}`

  const whatsappText = encodeURIComponent(
    `Olá, *${guest.name}*!\n\nVocê foi convidado para uma celebração especial do aniversário de *15 anos da Gaby*.\n\nPedimos, por gentileza, que *confirme sua presença até o dia 01 de setembro*, pois o buffet será contratado de acordo com o número de convidados confirmados.\n\nNeste link você pode confirmar sua presença e presentear a aniversariante:\n${inviteUrl}`
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Não foi possível copiar automaticamente.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
          setCopied(false)
        }
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] gap-5 overflow-y-auto p-4 sm:max-w-md sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="text-primary h-5 w-5" />
            Convite criado!
          </DialogTitle>
          <DialogDescription>
            <strong>{guest.name}</strong> foi adicionado à lista. Compartilhe o link personalizado abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Link do convite
            </Label>
            <div className="bg-muted flex items-center gap-2 overflow-hidden rounded-xl px-3 py-2.5">
              <code className="text-foreground min-w-0 flex-1 truncate text-xs sm:text-sm">
                {inviteUrl}
              </code>
              <button
                onClick={handleCopy}
                className={`-mr-1 shrink-0 rounded-md p-2 transition-colors ${
                  copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Copiar link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="h-11 flex-1 gap-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </Button>
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22c55e]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <Button variant="ghost" className="h-11 w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ManageCompanionsModal({
  open,
  onClose,
  guest,
  guests,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  guest: ManageTarget | null
  guests: Guest[]
  onSaved: (guestId: string, companions: Guest[]) => void
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ManageCompanionsData>({
    resolver: zodResolver(manageCompanionsSchema),
    defaultValues: { companions: [] },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'companions',
  })

  useEffect(() => {
    if (!open || !guest) return

    const currentCompanions = guests
      .filter((candidate) => candidate.primaryGuestId === guest.id)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
      }))

    replace(currentCompanions)
  }, [guest, guests, open, replace])

  const onSubmit = async (data: ManageCompanionsData) => {
    if (!guest) return

    const response = await fetch(`/api/admin/guests/${guest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const text = await response.text()
    const json = text ? JSON.parse(text) : {}

    if (!response.ok) {
      toast.error(json.error ?? 'Erro ao atualizar acompanhantes')
      return
    }

    onSaved(
      guest.id,
      (json.companions ?? []).map((companion: {
        id: string
        name: string
        status: GuestStatus
        confirmedAt: string | null
        createdAt: string
      }) => ({
        id: companion.id,
        name: companion.name,
        phone: guests.find((candidate) => candidate.id === guest.id)?.phone ?? '',
        guestCount: 1,
        status: companion.status,
        message: null,
        invitationCode: null,
        confirmedAt: companion.confirmedAt,
        viewedAt: null,
        createdAt: companion.createdAt,
        primaryGuestId: guest.id,
        primaryGuestName: guest.name,
      }))
    )

    toast.success('Acompanhantes atualizados com sucesso!')
    reset({ companions: [] })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
          reset({ companions: [] })
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar acompanhantes</DialogTitle>
          <DialogDescription>
            Adicione ou remova acompanhantes do convite de <strong>{guest?.name ?? ''}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-dashed px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="text-primary h-4 w-4" />
                  <p className="text-sm font-semibold">Acompanhantes do convite</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Apenas o admin pode adicionar ou remover acompanhantes.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => append({ name: '' })}
                disabled={fields.length >= 19}
              >
                <UserPlus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum acompanhante cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border px-3 py-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Acompanhante {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:text-destructive rounded-full p-1 transition-colors"
                        aria-label={`Remover acompanhante ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Nome do acompanhante"
                      aria-invalid={!!errors.companions?.[index]?.name}
                      {...register(`companions.${index}.name`)}
                    />
                    <input type="hidden" {...register(`companions.${index}.id`)} />
                    {errors.companions?.[index]?.name && (
                      <p className="text-destructive pt-2 text-xs">
                        {errors.companions[index]?.name?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar acompanhantes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditGuestModal({
  open,
  onClose,
  guest,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  guest: Guest | null
  onSaved: (guest: Guest) => void
}) {
  const isCompanion = Boolean(guest?.primaryGuestId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditGuestData>({
    resolver: zodResolver(editGuestSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (!open || !guest) return

    reset({
      name: guest.name,
      phone: guest.phone,
    })
  }, [guest, open, reset])

  const onSubmit = async (data: EditGuestData) => {
    if (!guest) return

    const response = await fetch(`/api/admin/guests/${guest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const text = await response.text()
    const json = text ? JSON.parse(text) : {}

    if (!response.ok) {
      toast.error(json.error ?? 'Erro ao atualizar convidado')
      return
    }

    onSaved(json.guest as Guest)
    toast.success('Convidado atualizado com sucesso!')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
          reset({ name: '', phone: '' })
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar convidado</DialogTitle>
          <DialogDescription>
            {isCompanion ? (
              <>
                Atualize os dados de <strong>{guest?.name ?? ''}</strong>. O telefone
                continua vinculado ao convite principal.
              </>
            ) : (
              <>
                Atualize os dados de <strong>{guest?.name ?? ''}</strong>. Se mudar o
                telefone, os acompanhantes deste convite também serão atualizados.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="e-name">Nome completo *</Label>
            <Input id="e-name" placeholder="Nome do convidado" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-phone">WhatsApp / Telefone *</Label>
            <Input
              id="e-phone"
              type="tel"
              placeholder="(11) 91234-5678"
              disabled={isCompanion}
              {...register('phone')}
            />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            {isCompanion && (
              <p className="text-muted-foreground text-xs">
                O telefone deste acompanhante é herdado do convidado principal.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function GuestsTable({ guests: initialGuests }: { guests: Guest[] }) {
  const [guests, setGuests] = useState<Guest[]>(() => sortGuests(initialGuests))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | GuestStatus>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [shareGuest, setShareGuest] = useState<{ name: string; invitationCode: string } | null>(null)
  const [manageGuest, setManageGuest] = useState<ManageTarget | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      phone: '',
      companionNames: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'companionNames',
  })

  const filtered = useMemo(
    () =>
      guests.filter((guest) => {
        const matchesSearch =
          !search ||
          guest.name.toLowerCase().includes(search.toLowerCase()) ||
          guest.phone.includes(search) ||
          guest.primaryGuestName?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || guest.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [guests, search, statusFilter]
  )

  const summary = useMemo(
    () => ({
      total: filtered.length,
      confirmed: filtered.filter((guest) => guest.status === 'CONFIRMED').length,
      pending: filtered.filter((guest) => guest.status === 'PENDING').length,
      declined: filtered.filter((guest) => guest.status === 'DECLINED').length,
    }),
    [filtered]
  )

  const handleExport = async () => {
    if (filtered.length === 0) {
      toast.error('Nenhum convidado para exportar com os filtros atuais.')
      return
    }

    setIsExporting(true)

    try {
      await exportGuestsSpreadsheet(filtered)
      toast.success('Planilha exportada com sucesso!')
    } catch {
      toast.error('Não foi possível exportar a planilha agora.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateInvite = async (guest: Guest) => {
    setGeneratingCode(guest.id)

    const response = await fetch(`/api/admin/guests/${guest.id}/invite`, { method: 'POST' })
    const text = await response.text()
    const json = text ? JSON.parse(text) : {}

    setGeneratingCode(null)

    if (!response.ok) {
      toast.error(json.error ?? 'Erro ao gerar link')
      return
    }

    const invitationCode: string = json.invitationCode
    setGuests((prev) =>
      sortGuests(
        prev.map((item) => (item.id === guest.id ? { ...item, invitationCode } : item))
      )
    )
    setShareGuest({ name: guest.name, invitationCode })
  }

  const onCreateSubmit = async (data: CreateData) => {
    const response = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const text = await response.text()
    const json = text ? JSON.parse(text) : {}

    if (!response.ok) {
      toast.error(json.error ?? 'Erro ao criar convidado')
      return
    }

    const createdGuest: Guest = {
      id: json.id,
      name: json.name,
      phone: json.phone,
      guestCount: json.guestCount ?? 1,
      status: json.status,
      message: null,
      invitationCode: json.invitationCode ?? null,
      confirmedAt: null,
      viewedAt: null,
      createdAt: new Date().toISOString(),
      primaryGuestId: null,
      primaryGuestName: null,
    }

    const createdCompanions: Guest[] = (json.companions ?? []).map((companion: {
      id: string
      name: string
      status: GuestStatus
      createdAt?: string
    }) => ({
      id: companion.id,
      name: companion.name,
      phone: json.phone,
      guestCount: 1,
      status: companion.status,
      message: null,
      invitationCode: null,
      confirmedAt: null,
      viewedAt: null,
      createdAt: companion.createdAt ?? new Date().toISOString(),
      primaryGuestId: json.id,
      primaryGuestName: json.name,
    }))

    setGuests((prev) => sortGuests([createdGuest, ...createdCompanions, ...prev]))

    setCreateOpen(false)
    reset({ name: '', phone: '', companionNames: [] })

    if (json.invitationCode) {
      setShareGuest({ name: json.name, invitationCode: json.invitationCode })
    } else {
      toast.success('Convidado criado!')
    }
  }

  const handleDeleteGuest = async (guest: Guest) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o convidado "${guest.name}"? Esta ação também remove o histórico de presentes vinculado a ele.`
    )

    if (!confirmed) {
      return
    }

    setDeletingGuestId(guest.id)

    try {
      const response = await fetch(`/api/admin/guests/${guest.id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const json = text ? JSON.parse(text) : {}

      if (!response.ok) {
        toast.error(json.error ?? 'Erro ao excluir convidado')
        return
      }

      setGuests((prev) =>
        sortGuests(
          prev.filter(
            (item) => item.id !== guest.id && item.primaryGuestId !== guest.id
          )
        )
      )

      if (shareGuest?.invitationCode === guest.invitationCode) {
        setShareGuest(null)
      }

      toast.success('Convidado excluído com sucesso!')
    } catch {
      toast.error('Não foi possível excluir o convidado agora.')
    } finally {
      setDeletingGuestId(null)
    }
  }

  const handleCompanionsSaved = (guestId: string, companions: Guest[]) => {
    setGuests((prev) => {
      const baseGuests = prev.filter((item) => item.id !== guestId && item.primaryGuestId !== guestId)
      const primaryGuest = prev.find((item) => item.id === guestId)
      if (!primaryGuest) return prev

      return sortGuests([
        {
          ...primaryGuest,
          guestCount: companions.length + 1,
        },
        ...companions,
        ...baseGuests,
      ])
    })
  }

  const handleGuestSaved = (updatedGuest: Guest) => {
    setGuests((prev) =>
      sortGuests(
        prev.map((item) => {
          if (item.id === updatedGuest.id) {
            return {
              ...item,
              ...updatedGuest,
            }
          }

          if (!updatedGuest.primaryGuestId && item.primaryGuestId === updatedGuest.id) {
            return {
              ...item,
              phone: updatedGuest.phone,
              primaryGuestName: updatedGuest.name,
            }
          }

          return item
        })
      )
    )

    if (updatedGuest.invitationCode && shareGuest?.invitationCode === updatedGuest.invitationCode) {
      setShareGuest({
        name: updatedGuest.name,
        invitationCode: updatedGuest.invitationCode,
      })
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">Gerencie, filtre e exporte a lista de convidados</p>
                <p className="text-muted-foreground text-sm">
                  A exportação gera um arquivo Excel com colunas ajustadas, cabeçalho e datas formatadas.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {summary.total} resultado(s)
                </Badge>
                <Badge variant="default" className="rounded-full px-3 py-1">
                  {summary.confirmed} confirmados
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {summary.pending} pendentes
                </Badge>
                {summary.declined > 0 && (
                  <Badge variant="destructive" className="rounded-full px-3 py-1">
                    {summary.declined} recusados
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:min-w-[420px]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por nome, telefone ou convite principal..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 bg-background pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                >
                  <SelectTrigger className="h-10 w-full bg-background sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os status</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmados</SelectItem>
                    <SelectItem value="PENDING">Pendentes</SelectItem>
                    <SelectItem value="DECLINED">Recusados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting || filtered.length === 0}
                  className="h-10 gap-2 bg-background sm:min-w-[190px]"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>{isExporting ? 'Exportando...' : 'Exportar Excel'}</span>
                </Button>
                <Button
                  className="h-10 gap-2 sm:min-w-[190px]"
                  onClick={() => {
                    reset({ name: '', phone: '', companionNames: [] })
                    setCreateOpen(true)
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Criar convidado</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-background shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Pessoas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Mensagem</TableHead>
                <TableHead className="hidden md:table-cell">Código</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                    Nenhum convidado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((guest) => {
                  const isCompanion = Boolean(guest.primaryGuestId)
                  const isPrimary = !isCompanion

                  return (
                    <TableRow
                      key={guest.id}
                      className={isCompanion ? 'bg-muted/20 hover:bg-muted/35' : 'hover:bg-muted/25'}
                    >
                      <TableCell>
                        <div className={isCompanion ? 'pl-4' : ''}>
                          <p className="font-medium">{isCompanion ? `↳ ${guest.name}` : guest.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {isCompanion
                              ? `Acompanhante de ${guest.primaryGuestName ?? 'convidado principal'}`
                              : 'Convidado principal'}
                          </p>
                          <p className="text-muted-foreground mt-2 line-clamp-8 whitespace-normal break-words text-xs lg:hidden">
                            <span className="font-medium text-foreground">Mensagem: </span>
                            {guest.message ?? 'Sem mensagem'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{guest.phone}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{guest.guestCount}</TableCell>
                      <TableCell>
                        <Badge variant={getGuestStatusTone(guest.status)}>
                          {getGuestStatusLabel(guest.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden max-w-[160px] truncate text-sm lg:table-cell">
                        {guest.message ?? '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {guest.invitationCode ? (
                          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                            {guest.invitationCode}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs sm:table-cell">
                        {guest.confirmedAt ? formatDate(guest.confirmedAt) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Editar convidado"
                            aria-label={`Editar convidado ${guest.name}`}
                            onClick={() => setEditingGuest(guest)}
                            className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {isPrimary && (
                            <button
                              title="Gerenciar acompanhantes"
                              onClick={() => setManageGuest({ id: guest.id, name: guest.name })}
                              className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                          )}

                          {isPrimary && guest.invitationCode ? (
                            <button
                              title="Compartilhar link de convite"
                              onClick={() =>
                                setShareGuest({
                                  name: guest.name,
                                  invitationCode: guest.invitationCode!,
                                })
                              }
                              className="text-muted-foreground hover:text-primary rounded p-1 transition-colors"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          ) : isPrimary ? (
                            <button
                              title="Gerar e compartilhar link de convite"
                              disabled={generatingCode === guest.id}
                              onClick={() => handleGenerateInvite(guest)}
                              className="text-muted-foreground hover:text-primary rounded p-1 transition-colors disabled:opacity-50"
                            >
                              {generatingCode === guest.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Link2 className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}

                          <button
                            title="Excluir convidado"
                            aria-label={`Excluir convidado ${guest.name}`}
                            disabled={deletingGuestId === guest.id}
                            onClick={() => handleDeleteGuest(guest)}
                            className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors disabled:opacity-50"
                          >
                            {deletingGuestId === guest.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar convidado</DialogTitle>
            <DialogDescription>
              Um link personalizado será gerado para este convidado. Se quiser, já cadastre os acompanhantes dele agora.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Nome completo *</Label>
              <Input id="c-name" placeholder="Nome do convidado" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">WhatsApp / Telefone *</Label>
              <Input
                id="c-phone"
                type="tel"
                placeholder="(11) 91234-5678"
                {...register('phone')}
              />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-3 rounded-2xl border border-dashed px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-4 w-4" />
                    <p className="text-sm font-semibold">Acompanhantes</p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    O admin pode cadastrar acompanhantes aqui e continuar gerenciando depois.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={() => append({ name: '' })}
                  disabled={fields.length >= 19}
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum acompanhante cadastrado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Acompanhante {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-destructive rounded-full p-1 transition-colors"
                          aria-label={`Remover acompanhante ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        placeholder="Nome do acompanhante"
                        aria-invalid={!!errors.companionNames?.[index]?.name}
                        {...register(`companionNames.${index}.name`)}
                      />
                      {errors.companionNames?.[index]?.name && (
                        <p className="text-destructive pt-2 text-xs">
                          {errors.companionNames[index]?.name?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar e gerar link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ManageCompanionsModal
        open={!!manageGuest}
        onClose={() => setManageGuest(null)}
        guest={manageGuest}
        guests={guests}
        onSaved={handleCompanionsSaved}
      />

      <EditGuestModal
        open={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        guest={editingGuest}
        onSaved={handleGuestSaved}
      />

      <ShareInviteModal
        open={!!shareGuest}
        onClose={() => setShareGuest(null)}
        guest={shareGuest}
      />
    </>
  )
}
