import { z } from 'zod'

const companionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome do acompanhante deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do acompanhante muito longo'),
})

export const rsvpSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    phone: z
      .string()
      .min(10, 'Telefone invalido - inclua o DDD')
      .max(20)
      .regex(/^[\d\s()\-\+]+$/, 'Telefone invalido'),
    companionNames: z.array(companionSchema).max(19, 'Maximo de 19 acompanhantes'),
    message: z.string().max(500, 'Maximo de 500 caracteres').optional(),
    invitationCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.companionNames.length + 1 > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companionNames'],
        message: 'Maximo de 20 pessoas por confirmacao.',
      })
    }

    const normalized = new Set<string>()
    for (const [index, companion] of data.companionNames.entries()) {
      const key = companion.name.trim().toLowerCase()
      if (normalized.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companionNames', index, 'name'],
          message: 'Este acompanhante ja foi adicionado.',
        })
        continue
      }

      normalized.add(key)
    }
  })

export type RsvpFormData = z.infer<typeof rsvpSchema>
