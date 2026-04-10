import { NextResponse } from 'next/server'
import { getUploadAdapter, getUploadProvider } from '@/lib/upload/adapters'
import { uploadCompleteSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = uploadCompleteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? 'Invalid completion payload',
        },
        { status: 400 },
      )
    }

    const provider = getUploadProvider()
    const adapter = getUploadAdapter(provider)
    const records = await adapter.completeUpload(parsed.data.items, parsed.data.uploaderName)

    return NextResponse.json({
      ok: true,
      provider,
      records,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete upload'

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 },
    )
  }
}
