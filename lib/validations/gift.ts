import { z } from 'zod'

export const reserveGiftSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z
    .string()
    .min(10, 'Telefone inválido — inclua o DDD')
    .max(20)
    .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone inválido'),
  invitationCode: z
    .string()
    .min(4, 'Código de convite obrigatório')
    .max(32)
    .toUpperCase(),
})

export type ReserveGiftData = z.infer<typeof reserveGiftSchema>
