import type { UploadAdapter } from './types'
import type { UploadFileInput } from '@/types/upload'
import { createStorageKey, createUploadedPendingRecords } from './shared'

export const mockUploadAdapter: UploadAdapter = {
  provider: 'mock',
  async createUploadTargets(files: UploadFileInput[], uploaderName) {
    return files.map((file) => {
      const uploadId = crypto.randomUUID()
      const key = createStorageKey(file.name, uploadId, uploaderName)

      return {
        id: file.id,
        uploadId,
        key,
        provider: 'mock',
        method: 'PUT',
        url: `/api/uploads/mock/${encodeURIComponent(key)}`,
        expiresIn: 300,
      }
    })
  },
  async completeUpload(items) {
    return createUploadedPendingRecords(items)
  },
}
