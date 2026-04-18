export type UploadProvider = 'mock' | 's3' | 'supabase' | 'firebase'
export type UploadMethod = 'PUT' | 'POST'
export type UploadApprovalStatus = 'pending' | 'approved' | 'rejected'
export type UploadStatus = 'presigned' | 'uploaded' | 'failed'

export interface UploadFileInput {
  id: string
  name: string
  type: string
  size: number
}

export interface UploadTarget {
  id: string
  uploadId: string
  key: string
  provider: UploadProvider
  method: UploadMethod
  url: string
  path?: string
  token?: string
  headers?: Record<string, string>
  fields?: Record<string, string>
  expiresIn: number
}

export interface UploadedFileConfirmation {
  uploadId: string
  key: string
}

export interface UploadCompletionRecord {
  id: string
  key: string
  approvalStatus: UploadApprovalStatus
  uploadStatus: UploadStatus
  uploadedAt: string | null
}

export interface GuestPhotoUploadRecord {
  id: string
  storage_provider: UploadProvider
  storage_bucket: string
  storage_key: string
  original_name: string
  mime_type: string
  size_bytes: number
  uploader_name: string | null
  upload_status: UploadStatus
  approval_status: UploadApprovalStatus
  presigned_at: string
  uploaded_at: string | null
  approved_at: string | null
  rejected_at: string | null
}
