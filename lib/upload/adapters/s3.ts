import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { UploadAdapter } from './types'
import type {
  GuestPhotoUploadRecord,
  UploadFileInput,
  UploadTarget,
} from '@/types/upload'
import {
  completeGuestPhotoUploads,
  insertGuestPhotoUploadRows,
  isUploadMetadataStoreConfigured,
} from '@/lib/upload/store'
import {
  createStorageKey,
  createUploadedPendingRecords,
  normalizeUploaderName,
} from './shared'

const SIGNED_UPLOAD_EXPIRY_SECONDS = 60 * 60 * 2

let s3Client: S3Client | undefined

function getRequiredEnv(
  name: 'S3_BUCKET' | 'S3_ENDPOINT' | 'S3_ACCESS_KEY_ID' | 'S3_SECRET_ACCESS_KEY',
) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required when UPLOAD_PROVIDER=s3`)
  }

  return value
}

function getS3Region() {
  return process.env.S3_REGION || 'auto'
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: getS3Region(),
      endpoint: getRequiredEnv('S3_ENDPOINT'),
      credentials: {
        accessKeyId: getRequiredEnv('S3_ACCESS_KEY_ID'),
        secretAccessKey: getRequiredEnv('S3_SECRET_ACCESS_KEY'),
      },
    })
  }

  return s3Client
}

export const s3UploadAdapter: UploadAdapter = {
  provider: 's3',
  async createUploadTargets(files: UploadFileInput[], uploaderName) {
    const bucket = getRequiredEnv('S3_BUCKET')
    const client = getS3Client()
    const normalizedName = normalizeUploaderName(uploaderName)
    const now = new Date().toISOString()
    const rows: GuestPhotoUploadRecord[] = []
    const targets: UploadTarget[] = []

    for (const file of files) {
      const uploadId = crypto.randomUUID()
      const key = createStorageKey(file.name, uploadId, normalizedName)
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: file.type,
        }),
        { expiresIn: SIGNED_UPLOAD_EXPIRY_SECONDS },
      )

      targets.push({
        id: file.id,
        uploadId,
        key,
        provider: 's3',
        method: 'PUT',
        url,
        headers: {
          'Content-Type': file.type,
        },
        expiresIn: SIGNED_UPLOAD_EXPIRY_SECONDS,
      })

      rows.push({
        id: uploadId,
        storage_provider: 's3',
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

    if (isUploadMetadataStoreConfigured()) {
      await insertGuestPhotoUploadRows(rows)
    }

    return targets
  },
  async completeUpload(items, uploaderName) {
    const normalizedName = normalizeUploaderName(uploaderName)

    if (!isUploadMetadataStoreConfigured()) {
      return createUploadedPendingRecords(items)
    }

    return completeGuestPhotoUploads(items, normalizedName)
  },
}
