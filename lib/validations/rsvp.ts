import { z } from 'zod'

export const rsvpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z
    .string()
    .min(10, 'Telefone inválido — inclua o DDD')
    .max(20)
    .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone inválido'),
  guestCount: z
    .number()
    .int()
    .min(1, 'Mínimo 1 pessoa')
    .max(20, 'Máximo 20 pessoas'),
  message: z.string().max(500, 'Máximo 500 caracteres').optional(),
  invitationCode: z.string().optional(),
})

export type RsvpFormData = z.infer<typeof rsvpSchema>
