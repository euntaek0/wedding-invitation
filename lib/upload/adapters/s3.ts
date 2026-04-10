import type { UploadAdapter } from './types'
import { createPendingRecords } from './shared'

export const s3UploadAdapter: UploadAdapter = {
  provider: 's3',
  async createUploadTargets() {
    // Setup required:
    // 1) Implement presigned URL generation using AWS SDK in this function
    // 2) Use env vars S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
    throw new Error(
      'S3 upload adapter is not configured. Implement presigned URL generation in lib/upload/adapters/s3.ts',
    )
  },
  async completeUpload(items) {
    return createPendingRecords(items)
  },
}
