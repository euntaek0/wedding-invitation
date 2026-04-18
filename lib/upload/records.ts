import type {
  GuestPhotoUploadRecord,
  UploadCompletionRecord,
  UploadedFileConfirmation,
} from '@/types/upload'

interface CompletionResolution {
  kind: 'existing' | 'update'
  patch: {
    uploader_name?: string | null
    upload_status?: 'uploaded'
    uploaded_at?: string
  }
  record: UploadCompletionRecord
}

export function toUploadCompletionRecord(
  record: Pick<GuestPhotoUploadRecord, 'id' | 'storage_key' | 'approval_status' | 'upload_status' | 'uploaded_at'>,
): UploadCompletionRecord {
  return {
    id: record.id,
    key: record.storage_key,
    approvalStatus: record.approval_status,
    uploadStatus: record.upload_status,
    uploadedAt: record.uploaded_at,
  }
}

export function resolveUploadCompletion(
  record: GuestPhotoUploadRecord | null | undefined,
  item: UploadedFileConfirmation,
  uploaderName?: string,
): CompletionResolution {
  if (!record) {
    throw new Error(`Upload session not found: ${item.uploadId}`)
  }

  if (record.storage_key !== item.key) {
    throw new Error(`Upload key mismatch for ${item.uploadId}`)
  }

  if (record.upload_status === 'uploaded') {
    return {
      kind: 'existing',
      patch: {},
      record: toUploadCompletionRecord(record),
    }
  }

  if (record.upload_status !== 'presigned') {
    throw new Error(`Upload ${item.uploadId} is not in a completable state.`)
  }

  const uploadedAt = new Date().toISOString()
  const nextRecord: GuestPhotoUploadRecord = {
    ...record,
    uploader_name: uploaderName ?? record.uploader_name,
    upload_status: 'uploaded',
    uploaded_at: uploadedAt,
  }

  return {
    kind: 'update',
    patch: {
      uploader_name: uploaderName ?? record.uploader_name,
      upload_status: 'uploaded',
      uploaded_at: uploadedAt,
    },
    record: toUploadCompletionRecord(nextRecord),
  }
}
