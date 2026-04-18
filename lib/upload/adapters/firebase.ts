import type { UploadAdapter } from './types'
import { createUploadedPendingRecords } from './shared'

export const firebaseUploadAdapter: UploadAdapter = {
  provider: 'firebase',
  async createUploadTargets() {
    // Setup required:
    // 1) Generate resumable upload session URLs from Firebase Admin SDK
    // 2) Use env vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET
    throw new Error(
      'Firebase upload adapter is not configured. Implement upload session generation in lib/upload/adapters/firebase.ts',
    )
  },
  async completeUpload(items) {
    return createUploadedPendingRecords(items)
  },
}
