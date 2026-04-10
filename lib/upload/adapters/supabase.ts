import type { UploadAdapter } from './types'
import { createPendingRecords } from './shared'

export const supabaseUploadAdapter: UploadAdapter = {
  provider: 'supabase',
  async createUploadTargets() {
    // Setup required:
    // 1) Generate signed upload URLs with Supabase service role key on server
    // 2) Use env vars SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET
    throw new Error(
      'Supabase upload adapter is not configured. Implement signed upload URL generation in lib/upload/adapters/supabase.ts',
    )
  },
  async completeUpload(items) {
    return createPendingRecords(items)
  },
}
