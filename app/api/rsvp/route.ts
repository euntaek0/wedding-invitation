import { NextResponse } from 'next/server'
import { rsvpSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = rsvpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? 'Invalid RSVP payload',
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

    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL

    // Setup required:
    // Connect your deployed Google Apps Script Web App URL in GOOGLE_APPS_SCRIPT_WEBHOOK_URL.
    if (!webhookUrl) {
      return NextResponse.json({
        ok: true,
        message: 'RSVP stored in mock mode. Set GOOGLE_APPS_SCRIPT_WEBHOOK_URL to enable Google Sheets.',
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
        message,
      },
      { status: 500 },
    )
  }
}
