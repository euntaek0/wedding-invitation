import { z } from 'zod'

export const rsvpSchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    phone: z
      .string()
      .trim()
      .min(8)
      .max(20)
      .regex(/^[0-9+\-()\s]+$/, 'Invalid phone format'),
    side: z.enum(['groom', 'bride']),
    attendance: z.enum(['attending', 'notAttending']),
    attendeeCount: z.coerce.number().int().min(0).max(20),
    meal: z.enum(['yes', 'no']),
    message: z.string().trim().max(300).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.attendance === 'attending' && data.attendeeCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['attendeeCount'],
        message: 'Attendee count must be at least 1 when attending',
      })
    }

    if (data.attendance === 'notAttending' && data.attendeeCount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['attendeeCount'],
        message: 'Attendee count must be 0 when not attending',
      })
    }
  })

export const uploadFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  type: z.string().min(1),
  size: z.number().int().positive(),
})

export const uploadPresignSchema = z.object({
  files: z.array(uploadFileSchema).min(1).max(20),
})

export const uploadCompleteSchema = z.object({
  uploaderName: z.string().trim().max(40).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        key: z.string().min(1),
        name: z.string().min(1),
        type: z.string().min(1),
        size: z.number().int().positive(),
        url: z.string().url(),
      }),
    )
    .min(1),
})
