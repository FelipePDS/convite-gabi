import { z } from 'zod'

const rsvpAttendanceSchema = z.enum(['CONFIRMED', 'DECLINED'])

const companionAttendanceSchema = z.object({
  id: z.string().min(1),
  status: rsvpAttendanceSchema.optional(),
})

export const rsvpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z
    .string()
    .min(10, 'Telefone inválido - inclua o DDD')
    .max(20)
    .regex(/^[\d\s()\-\+]+$/, 'Telefone inválido'),
  attendance: rsvpAttendanceSchema.optional(),
  companionAttendance: z.array(companionAttendanceSchema).max(19).default([]),
  message: z.string().max(500, 'Máximo de 500 caracteres').optional(),
  invitationCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.attendance) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['attendance'],
      message: 'Escolha se você vai confirmar ou recusar o convite.',
    })
  }
})

export type RsvpFormData = z.input<typeof rsvpSchema>
