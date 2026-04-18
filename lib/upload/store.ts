import type {
  GuestPhotoUploadRecord,
  UploadCompletionRecord,
  UploadedFileConfirmation,
} from '@/types/upload'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveUploadCompletion } from './records'

export function isUploadMetadataStoreConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function insertGuestPhotoUploadRows(rows: GuestPhotoUploadRecord[]) {
  if (rows.length === 0) {
    return
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('guest_photo_uploads').insert(rows)

  if (error) {
    throw new Error(`Failed to store upload session: ${error.message}`)
  }
}

export async function completeGuestPhotoUploads(
  items: UploadedFileConfirmation[],
  uploaderName?: string,
): Promise<UploadCompletionRecord[]> {
  const supabase = createSupabaseAdminClient()
  const uploadIds = items.map((item) => item.uploadId)
  const { data, error } = await supabase
    .from('guest_photo_uploads')
    .select('*')
    .in('id', uploadIds)

  if (error) {
    throw new Error(`Failed to load upload sessions: ${error.message}`)
  }

  const recordMap = new Map((data ?? []).map((record) => [record.id, record as GuestPhotoUploadRecord]))
  const records: UploadCompletionRecord[] = []

  for (const item of items) {
    const resolution = resolveUploadCompletion(recordMap.get(item.uploadId), item, uploaderName)

    if (resolution.kind === 'update') {
      const { data: updated, error: updateError } = await supabase
        .from('guest_photo_uploads')
        .update(resolution.patch)
        .eq('id', item.uploadId)
        .select('id, storage_key, approval_status, upload_status, uploaded_at')
        .single()

      if (updateError) {
        throw new Error(`Failed to finalize upload ${item.uploadId}: ${updateError.message}`)
      }

      records.push({
        id: updated.id,
        key: updated.storage_key,
        approvalStatus: updated.approval_status,
        uploadStatus: updated.upload_status,
        uploadedAt: updated.uploaded_at,
      })
      continue
    }

    records.push(resolution.record)
  }

  return records
}
