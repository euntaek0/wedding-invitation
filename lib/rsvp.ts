import { ZodError } from 'zod'
import { rsvpSchema } from '@/lib/validators'
import type { RSVPFieldErrors, RSVPPayload } from '@/types/rsvp'

export function getZodFieldErrors(error: ZodError): RSVPFieldErrors {
  const fieldErrors: RSVPFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (typeof field === 'string' && !(field in fieldErrors)) {
      fieldErrors[field as keyof RSVPFieldErrors] = issue.message
    }
  }

  return fieldErrors
}

export function normalizeRsvpPayload(payload: RSVPPayload): RSVPPayload {
  const message = payload.message?.trim()

  if (payload.attendance === 'notAttending') {
    return {
      ...payload,
      attendeeCount: 0,
      meal: 'no',
      message,
    }
  }

  return {
    ...payload,
    attendeeCount: Math.max(payload.attendeeCount, 1),
    meal: payload.meal,
    message,
  }
}

export function parseRsvpPayload(input: unknown) {
  const parsed = rsvpSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? 'Invalid RSVP payload',
      fieldErrors: getZodFieldErrors(parsed.error),
    }
  }

  return {
    ok: true as const,
    data: normalizeRsvpPayload(parsed.data),
  }
}
