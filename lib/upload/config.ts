import type { UploadFileInput } from '@/types/upload'

const DEFAULT_MAX_FILES = 10
const DEFAULT_MAX_FILE_SIZE_MB = 12

export const allowedUploadMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
export const allowedUploadMimeTypeLabel = 'JPG, PNG, WEBP'

export type UploadIssueCode = 'tooManyFiles' | 'invalidType' | 'tooLarge'

export interface UploadValidationIssue {
  code: UploadIssueCode
  fileId?: string
  fileName?: string
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.floor(parsed)
}

export const uploadConstraints = {
  maxFiles: parsePositiveInt(
    process.env.NEXT_PUBLIC_UPLOAD_MAX_FILES ?? process.env.UPLOAD_MAX_FILES,
    DEFAULT_MAX_FILES,
  ),
  maxFileSizeMb: parsePositiveInt(
    process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB ?? process.env.UPLOAD_MAX_FILE_SIZE_MB,
    DEFAULT_MAX_FILE_SIZE_MB,
  ),
  allowedMimeTypes: [...allowedUploadMimeTypes],
}

export const uploadMaxFileSizeBytes = uploadConstraints.maxFileSizeMb * 1024 * 1024

export function isAllowedUploadMimeType(type: string) {
  return uploadConstraints.allowedMimeTypes.includes(type as (typeof allowedUploadMimeTypes)[number])
}

export function getUploadFileIssue(file: Pick<UploadFileInput, 'type' | 'size'>): UploadIssueCode | null {
  if (!isAllowedUploadMimeType(file.type)) {
    return 'invalidType'
  }

  if (file.size > uploadMaxFileSizeBytes) {
    return 'tooLarge'
  }

  return null
}

export function validateUploadFiles(files: UploadFileInput[]): UploadValidationIssue[] {
  const issues: UploadValidationIssue[] = []

  if (files.length > uploadConstraints.maxFiles) {
    issues.push({ code: 'tooManyFiles' })
  }

  for (const file of files) {
    const code = getUploadFileIssue(file)

    if (code) {
      issues.push({
        code,
        fileId: file.id,
        fileName: file.name,
      })
    }
  }

  return issues
}

export function getUploadValidationMessage(issue: UploadValidationIssue) {
  switch (issue.code) {
    case 'tooManyFiles':
      return `You can upload up to ${uploadConstraints.maxFiles} files at a time.`
    case 'invalidType':
      return `${issue.fileName ?? 'File'} must be a ${allowedUploadMimeTypeLabel} image.`
    case 'tooLarge':
      return `${issue.fileName ?? 'File'} must be ${uploadConstraints.maxFileSizeMb}MB or smaller.`
    default:
      return 'Invalid upload request.'
  }
}
