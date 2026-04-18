import { z } from 'zod'

export const rsvpSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(40),
    phone: z
      .string()
      .trim()
      .min(8, 'Phone number is too short')
      .max(20, 'Phone number is too long')
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
  })

export const uploadFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  type: z.string().min(1),
  size: z.number().int().positive(),
})

export const uploadPresignSchema = z.object({
  uploaderName: z.string().trim().max(40).optional(),
  files: z.array(uploadFileSchema).min(1).max(20),
})

export const uploadCompleteSchema = z.object({
  uploaderName: z.string().trim().max(40).optional(),
  items: z
    .array(
      z.object({
        uploadId: z.string().uuid(),
        key: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
})
