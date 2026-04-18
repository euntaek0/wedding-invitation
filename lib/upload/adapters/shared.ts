import type {
  UploadCompletionRecord,
  UploadedFileConfirmation,
} from '@/types/upload'

export function createUploadedPendingRecords(
  items: UploadedFileConfirmation[],
): UploadCompletionRecord[] {
  const now = new Date().toISOString()

  return items.map((item) => ({
    id: item.uploadId,
    key: item.key,
    approvalStatus: 'pending',
    uploadStatus: 'uploaded',
    uploadedAt: now,
  }))
}

function sanitizeStorageSegment(value: string | undefined, fallback: string) {
  const cleaned = value
    ?.normalize('NFC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/]/g, '-')
    .replace(/[^\p{L}\p{N}._-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '')

  return cleaned || fallback
}

export function createStorageKey(
  fileName: string,
  uploadId = crypto.randomUUID(),
  uploaderName?: string,
) {
  const safeName = sanitizeStorageSegment(fileName, 'upload')
  const safeUploaderName = sanitizeStorageSegment(uploaderName, 'guest')
  const datePath = new Date().toISOString().slice(0, 10)

  return `guest-uploads/${safeUploaderName}/${datePath}/${uploadId}-${safeName}`
}

export function normalizeUploaderName(name?: string) {
  const trimmed = name?.trim()
  return trimmed ? trimmed : undefined
}
