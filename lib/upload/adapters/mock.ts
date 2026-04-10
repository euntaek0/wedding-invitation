import type { UploadAdapter } from './types'
import type { UploadFileInput } from '@/types/upload'
import { createPendingRecords, createStorageKey } from './shared'

export const mockUploadAdapter: UploadAdapter = {
  provider: 'mock',
  async createUploadTargets(files: UploadFileInput[]) {
    return files.map((file) => {
      const key = createStorageKey(file.name)

      return {
        id: file.id,
        key,
        provider: 'mock',
        method: 'PUT',
        url: `/api/uploads/mock/${encodeURIComponent(key)}`,
        publicUrl: `/api/uploads/mock/${encodeURIComponent(key)}`,
        expiresIn: 300,
      }
    })
  },
  async completeUpload(items) {
    return createPendingRecords(items)
  },
}
