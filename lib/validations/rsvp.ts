import { z } from 'zod'

const companionAttendanceSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
})

export const rsvpSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    phone: z
      .string()
      .min(10, 'Telefone inválido - inclua o DDD')
      .max(20)
      .regex(/^[\d\s()\-\+]+$/, 'Telefone inválido'),
    attending: z.enum(['CONFIRMED', 'DECLINED']).optional(),
    companionAttendance: z.array(companionAttendanceSchema).max(19).default([]),
    message: z.string().max(500, 'Máximo de 500 caracteres').optional(),
    invitationCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.attending) {
      ctx.addIssue({
        code: 'custom',
        path: ['attending'],
        message: 'Conte pra gente se você poderá comparecer',
      })
    }
  })

export type RsvpFormData = z.input<typeof rsvpSchema>
