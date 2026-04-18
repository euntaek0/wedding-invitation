import assert from 'node:assert/strict'
import test from 'node:test'
import {
  uploadConstraints,
  uploadMaxFileSizeBytes,
  validateUploadFiles,
} from '../lib/upload/config'
import { resolveUploadCompletion } from '../lib/upload/records'
import { createStorageKey as createUploadStorageKey } from '../lib/upload/adapters/shared'
import type { GuestPhotoUploadRecord } from '../types/upload'

function createRecord(overrides: Partial<GuestPhotoUploadRecord> = {}): GuestPhotoUploadRecord {
  return {
    id: '8f6517d2-f340-4a35-bb3d-c59c2d0b1847',
    storage_provider: 'supabase',
    storage_bucket: 'guest-uploads',
    storage_key: 'guest-uploads/guest/2026-04-18/example.jpg',
    original_name: 'example.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 1024,
    uploader_name: null,
    upload_status: 'presigned',
    approval_status: 'pending',
    presigned_at: '2026-04-18T10:00:00.000Z',
    uploaded_at: null,
    approved_at: null,
    rejected_at: null,
    ...overrides,
  }
}

test('flags too many upload files', () => {
  const files = Array.from({ length: uploadConstraints.maxFiles + 1 }, (_, index) => ({
    id: `file-${index}`,
    name: `photo-${index}.jpg`,
    type: 'image/jpeg',
    size: 1024,
  }))

  const issues = validateUploadFiles(files)

  assert.equal(issues[0]?.code, 'tooManyFiles')
})

test('flags invalid upload mime type and size', () => {
  const issues = validateUploadFiles([
    {
      id: 'gif-file',
      name: 'photo.gif',
      type: 'image/gif',
      size: 1024,
    },
    {
      id: 'large-file',
      name: 'photo.jpg',
      type: 'image/jpeg',
      size: uploadMaxFileSizeBytes + 1,
    },
  ])

  assert.deepEqual(
    issues.map((issue) => issue.code),
    ['invalidType', 'tooLarge'],
  )
})

test('creates storage keys under uploader name and date path', () => {
  const key = createUploadStorageKey('photo 01.jpg', 'upload-123', '김 예은')

  assert.match(key, /^guest-uploads\/김-예은\/\d{4}-\d{2}-\d{2}\/upload-123-photo-01\.jpg$/)
})

test('falls back to guest path when uploader name is missing', () => {
  const key = createUploadStorageKey('family.png', 'upload-456')

  assert.match(key, /^guest-uploads\/guest\/\d{4}-\d{2}-\d{2}\/upload-456-family\.png$/)
})

test('resolves a presigned upload into uploaded state', () => {
  const resolution = resolveUploadCompletion(
    createRecord(),
    {
      uploadId: '8f6517d2-f340-4a35-bb3d-c59c2d0b1847',
      key: 'guest-uploads/guest/2026-04-18/example.jpg',
    },
    'Guest',
  )

  assert.equal(resolution.kind, 'update')
  assert.equal(resolution.patch.upload_status, 'uploaded')
  assert.equal(resolution.patch.uploader_name, 'Guest')
  assert.equal(resolution.record.uploadStatus, 'uploaded')
  assert.equal(resolution.record.approvalStatus, 'pending')
})

test('throws when upload session is missing', () => {
  assert.throws(
    () =>
      resolveUploadCompletion(
        null,
        {
          uploadId: '8f6517d2-f340-4a35-bb3d-c59c2d0b1847',
          key: 'guest-uploads/guest/2026-04-18/example.jpg',
        },
      ),
    /Upload session not found/,
  )
})

test('throws on upload key mismatch', () => {
  assert.throws(
    () =>
      resolveUploadCompletion(
        createRecord(),
        {
          uploadId: '8f6517d2-f340-4a35-bb3d-c59c2d0b1847',
          key: 'guest-uploads/guest/2026-04-18/wrong.jpg',
        },
      ),
    /Upload key mismatch/,
  )
})

test('keeps uploaded completion idempotent', () => {
  const resolution = resolveUploadCompletion(
    createRecord({ upload_status: 'uploaded', uploaded_at: '2026-04-18T10:10:00.000Z' }),
    {
      uploadId: '8f6517d2-f340-4a35-bb3d-c59c2d0b1847',
      key: 'guest-uploads/guest/2026-04-18/example.jpg',
    },
    'Guest',
  )

  assert.equal(resolution.kind, 'existing')
  assert.equal(resolution.record.uploadStatus, 'uploaded')
  assert.equal(resolution.record.uploadedAt, '2026-04-18T10:10:00.000Z')
})
