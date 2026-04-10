import type { UploadProvider } from '@/types/upload'
import type { UploadAdapter } from './types'
import { firebaseUploadAdapter } from './firebase'
import { mockUploadAdapter } from './mock'
import { s3UploadAdapter } from './s3'
import { supabaseUploadAdapter } from './supabase'

const adapters: Record<UploadProvider, UploadAdapter> = {
  mock: mockUploadAdapter,
  s3: s3UploadAdapter,
  supabase: supabaseUploadAdapter,
  firebase: firebaseUploadAdapter,
}

export function getUploadAdapter(provider: UploadProvider): UploadAdapter {
  return adapters[provider] ?? mockUploadAdapter
}

export function getUploadProvider(): UploadProvider {
  const provider = process.env.UPLOAD_PROVIDER ?? 'mock'

  if (provider === 's3' || provider === 'supabase' || provider === 'firebase') {
    return provider
  }

  return 'mock'
}
