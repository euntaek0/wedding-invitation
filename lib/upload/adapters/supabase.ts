import type { UploadAdapter } from './types'
import type {
  GuestPhotoUploadRecord,
  UploadFileInput,
  UploadTarget,
} from '@/types/upload'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  completeGuestPhotoUploads,
  insertGuestPhotoUploadRows,
} from '@/lib/upload/store'
import { createStorageKey, normalizeUploaderName } from './shared'

function getRequiredBucket() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET

  if (!bucket) {
    throw new Error('SUPABASE_STORAGE_BUCKET is required when UPLOAD_PROVIDER=supabase')
  }

  return bucket
}

export const supabaseUploadAdapter: UploadAdapter = {
  provider: 'supabase',
  async createUploadTargets(files: UploadFileInput[], uploaderName) {
    const bucket = getRequiredBucket()
    const supabase = createSupabaseAdminClient()
    const normalizedName = normalizeUploaderName(uploaderName)
    const now = new Date().toISOString()
    const targets: UploadTarget[] = []
    const rows: GuestPhotoUploadRecord[] = []

    for (const file of files) {
      const uploadId = crypto.randomUUID()
      const key = createStorageKey(file.name, uploadId, normalizedName)
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(key)

      if (error || !data) {
        throw new Error(error?.message ?? 'Failed to create signed upload URL')
      }

      targets.push({
        id: file.id,
        uploadId,
        key,
        provider: 'supabase',
        method: 'PUT',
        url: data.signedUrl,
        path: data.path,
        token: data.token,
        fields: {
          cacheControl: '3600',
        },
        headers: {
          'x-upsert': 'false',
        },
        expiresIn: 60 * 60 * 2,
      })

      rows.push({
        id: uploadId,
        storage_provider: 'supabase',
        storage_bucket: bucket,
        storage_key: key,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        uploader_name: normalizedName ?? null,
        upload_status: 'presigned',
        approval_status: 'pending',
        presigned_at: now,
        uploaded_at: null,
        approved_at: null,
        rejected_at: null,
      })
    }

    await insertGuestPhotoUploadRows(rows)

    return targets
  },
  async completeUpload(items, uploaderName) {
    const normalizedName = normalizeUploaderName(uploaderName)
    return completeGuestPhotoUploads(items, normalizedName)
  },
}
