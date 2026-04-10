export type UploadProvider = 'mock' | 's3' | 'supabase' | 'firebase'

export interface UploadFileInput {
  id: string
  name: string
  type: string
  size: number
}

export interface UploadTarget {
  id: string
  key: string
  provider: UploadProvider
  method: 'PUT' | 'POST'
  url: string
  headers?: Record<string, string>
  fields?: Record<string, string>
  publicUrl?: string
  expiresIn: number
}

export interface UploadedFileConfirmation {
  id: string
  key: string
  name: string
  type: string
  size: number
  url: string
}

export interface UploadCompletionRecord extends UploadedFileConfirmation {
  approvalStatus: 'pending'
  uploadedAt: string
}
