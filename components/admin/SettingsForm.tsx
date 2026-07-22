'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  title: z.string().min(1, 'Obrigatório').max(100),
  description: z.string().max(2000).optional(),
  eventDate: z.string().min(1, 'Obrigatório'),
  venueName: z.string().max(200).optional(),
  address: z.string().min(1, 'Obrigatório').max(300),
  mapsUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  parking: z.string().max(200).optional(),
  dressCode: z.string().max(100).optional(),
  contact: z.string().max(100).optional(),
  pixKey: z.string().max(100).optional(),
  qrCodeUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface SettingsFormProps {
  initial: Partial<FormData>
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  })

  const onSubmit = async (data: FormData) => {
    // Convert local datetime-local to ISO (add seconds if missing)
    const eventDate = data.eventDate.includes('T')
      ? new Date(data.eventDate).toISOString()
      : new Date(data.eventDate + ':00').toISOString()

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, eventDate }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao salvar')
      return
    }
    toast.success('Configurações salvas!')
  }

  const field = (
    id: keyof FormData,
    label: string,
    props?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...register(id)} {...props} />
      {errors[id] && <p className="text-destructive text-xs">{errors[id]?.message as string}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      {field('title', 'Título do evento *')}

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={3} {...register('description')} />
      </div>

      {field('eventDate', 'Data e hora do evento *', { type: 'datetime-local' })}
      {field('venueName', 'Nome do local / salão', { placeholder: 'Ex: Salão Bella Vida' })}
      {field('address', 'Endereço *')}
      {field('mapsUrl', 'URL do Google Maps (embed)', { placeholder: 'https://maps.google.com/…' })}
      {field('parking', 'Estacionamento')}
      {field('dressCode', 'Traje')}
      {field('contact', 'Contato')}
      {field('pixKey', 'Chave PIX')}
      {field('qrCodeUrl', 'URL do QR Code (Cloudinary)', { placeholder: 'https://res.cloudinary.com/…' })}

      <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvar configurações
      </Button>
    </form>
  )
}
