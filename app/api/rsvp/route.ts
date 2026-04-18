import { NextResponse } from 'next/server'
import { parseRsvpPayload } from '@/lib/rsvp'
import type { RSVPApiResponse } from '@/types/rsvp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = parseRsvpPayload(body)

    if (!parsed.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.message,
          fieldErrors: parsed.fieldErrors,
        },
        { status: 400 },
      )
    }

    const payload = {
      ...parsed.data,
      message: parsed.data.message ?? '',
      submittedAt: new Date().toISOString(),
      source: 'wedding-invitation-web',
    }

    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL?.trim()
    const isProduction = process.env.NODE_ENV === 'production'

    if (!webhookUrl) {
      if (isProduction) {
        return NextResponse.json<RSVPApiResponse>(
          {
            ok: false,
            message: 'RSVP webhook is not configured on the server.',
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        ok: true,
        message: 'RSVP stored in development mock mode.',
        data: payload,
      })
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Webhook error (${response.status}): ${detail.slice(0, 140)}`)
    }

    return NextResponse.json({
      ok: true,
      message: 'RSVP submitted successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit RSVP'

    return NextResponse.json(
      {
        ok: false,
        message:
          process.env.NODE_ENV === 'production'
            ? 'RSVP could not be delivered. Please try again shortly.'
            : message,
      },
      { status: 502 },
    )
  }
}
