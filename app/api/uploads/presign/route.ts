import { NextResponse } from 'next/server'
import { getUploadAdapter, getUploadProvider } from '@/lib/upload/adapters'
import { uploadPresignSchema } from '@/lib/validators'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = uploadPresignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? 'Invalid upload request',
        },
        { status: 400 },
      )
    }

    const provider = getUploadProvider()
    const adapter = getUploadAdapter(provider)
    const targets = await adapter.createUploadTargets(parsed.data.files)

    return NextResponse.json({
      ok: true,
      provider,
      targets,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create upload target'

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 },
    )
  }
}
