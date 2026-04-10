import type {
  UploadCompletionRecord,
  UploadedFileConfirmation,
} from '@/types/upload'

export function createPendingRecords(
  items: UploadedFileConfirmation[],
): UploadCompletionRecord[] {
  const now = new Date().toISOString()

  return items.map((item) => ({
    ...item,
    approvalStatus: 'pending',
    uploadedAt: now,
  }))
}

export function createStorageKey(fileName: string) {
  const cleaned = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '')
  return `guest-uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleaned}`
}
