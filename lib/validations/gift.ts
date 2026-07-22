import { z } from 'zod'

export const reserveGiftSchema = z.object({
  invitationCode: z
    .string()
    .min(4, 'Codigo de convite obrigatorio')
    .max(32)
    .toUpperCase(),
})

export type ReserveGiftData = z.infer<typeof reserveGiftSchema>
