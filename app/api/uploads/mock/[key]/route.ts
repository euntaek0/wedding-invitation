import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const { pathname } = new URL(request.url)
  const key = decodeURIComponent(pathname.split('/').pop() ?? '')
  const body = await request.arrayBuffer()

  return NextResponse.json({
    ok: true,
    key,
    size: body.byteLength,
  })
}
