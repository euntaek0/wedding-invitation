'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { Modal } from '@/components/ui/modal'
import {
  allowedUploadMimeTypeLabel,
  getUploadFileIssue,
  type UploadIssueCode,
  uploadConstraints,
} from '@/lib/upload/config'
import type { UploadTarget } from '@/types/upload'

type UploadCopy = {
  heading: string
  description: string
  openModal: string
  closeModal: string
  uploaderName: string
  fileInput: string
  helper: string
  limitNote: string
  privacyNotice: string
  submit: string
  uploading: string
  done: string
  failed: string
  retry: string
  remove: string
  tooManyFiles: string
  invalidType: string
  tooLarge: string
  missingTarget: string
  finalizeFailed: string
}

interface GuestUploadSectionProps {
  copy: UploadCopy
}

type UploadItemStatus = 'ready' | 'uploading' | 'success' | 'error'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
  status: UploadItemStatus
  progress: number
  uploadId?: string
  key?: string
  error?: string
}

function createUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function fillTemplate(template: string, replacements: Record<string, string | number>) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  )
}

function uploadViaTarget(
  file: File,
  target: UploadTarget,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(target.method, target.url)

    if (target.headers) {
      Object.entries(target.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return
      }

      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
        return
      }

      reject(new Error(`Upload failed with status ${xhr.status}`))
    }

    xhr.onerror = () => reject(new Error('Network upload error'))

    if (target.provider === 'supabase') {
      const form = new FormData()

      Object.entries(target.fields ?? {}).forEach(([key, value]) => {
        form.append(key, value)
      })

      form.append('', file)
      xhr.send(form)
      return
    }

    if (target.method === 'POST') {
      const form = new FormData()

      Object.entries(target.fields ?? {}).forEach(([key, value]) => {
        form.append(key, value)
      })

      form.append('file', file)
      xhr.send(form)
      return
    }

    xhr.send(file)
  })
}

export function GuestUploadSection({ copy }: GuestUploadSectionProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploaderName, setUploaderName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectionErrors, setSelectionErrors] = useState<string[]>([])
  const itemsRef = useRef<UploadItem[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const hasUploadable = useMemo(() => {
    return items.some((item) => item.status === 'ready' || item.status === 'error')
  }, [items])

  const limitLabel = useMemo(() => {
    return fillTemplate(copy.limitNote, {
      count: uploadConstraints.maxFiles,
      sizeMb: uploadConstraints.maxFileSizeMb,
    })
  }, [copy.limitNote])

  const formatSelectionError = (code: UploadIssueCode, fileName?: string) => {
    switch (code) {
      case 'tooManyFiles':
        return fillTemplate(copy.tooManyFiles, {
          count: uploadConstraints.maxFiles,
        })
      case 'invalidType':
        return fillTemplate(copy.invalidType, {
          name: fileName ?? 'file',
        })
      case 'tooLarge':
        return fillTemplate(copy.tooLarge, {
          name: fileName ?? 'file',
          sizeMb: uploadConstraints.maxFileSizeMb,
        })
      default:
        return copy.failed
    }
  }

  const appendFiles = (files: FileList | null) => {
    if (!files) {
      return
    }

    const nextErrors: string[] = []
    const remaining = Math.max(uploadConstraints.maxFiles - items.length, 0)
    const incoming = Array.from(files)

    if (incoming.length > remaining) {
      nextErrors.push(formatSelectionError('tooManyFiles'))
    }

    const nextItems: UploadItem[] = []
    for (const file of incoming.slice(0, remaining)) {
      const issue = getUploadFileIssue({
        type: file.type,
        size: file.size,
      })

      if (issue) {
        nextErrors.push(formatSelectionError(issue, file.name))
        continue
      }

      nextItems.push({
        id: createUploadId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'ready',
        progress: 0,
      })
    }

    setSelectionErrors(nextErrors)
    setItems((prev) => [...prev, ...nextItems])
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return prev.filter((item) => item.id !== id)
    })
  }

  const startUpload = async (selectedIds?: string[]) => {
    if (isUploading) {
      return
    }

    const candidates = items.filter((item) => {
      if (selectedIds && !selectedIds.includes(item.id)) {
        return false
      }

      return item.status === 'ready' || item.status === 'error'
    })

    if (candidates.length === 0) {
      return
    }

    setIsUploading(true)
    setFeedback(null)
    setSelectionErrors([])

    try {
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploaderName: uploaderName.trim() || undefined,
          files: candidates.map((item) => ({
            id: item.id,
            name: item.file.name,
            type: item.file.type,
            size: item.file.size,
          })),
        }),
      })

      const presignResult = (await presignResponse.json()) as {
        ok: boolean
        message?: string
        targets?: UploadTarget[]
      }

      if (!presignResponse.ok || !presignResult.ok || !presignResult.targets) {
        throw new Error(presignResult.message ?? copy.failed)
      }

      const targetMap = new Map(presignResult.targets.map((target) => [target.id, target]))
      const completedItems: Array<{ uploadId: string; key: string }> = []
      let hadError = false

      for (const candidate of candidates) {
        const target = targetMap.get(candidate.id)

        if (!target) {
          hadError = true
          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? { ...item, status: 'error', error: copy.missingTarget }
                : item,
            ),
          )
          continue
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === candidate.id
              ? { ...item, status: 'uploading', progress: 0, error: undefined }
              : item,
          ),
        )

        try {
          await uploadViaTarget(candidate.file, target, (progress) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === candidate.id ? { ...item, progress } : item,
              ),
            )
          })

          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? {
                    ...item,
                    status: 'success',
                    progress: 100,
                    uploadId: target.uploadId,
                    key: target.key,
                  }
                : item,
            ),
          )

          completedItems.push({
            uploadId: target.uploadId,
            key: target.key,
          })
        } catch (error) {
          hadError = true
          const message = error instanceof Error ? error.message : copy.failed
          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? { ...item, status: 'error', error: message }
                : item,
            ),
          )
        }
      }

      if (completedItems.length > 0) {
        const completeResponse = await fetch('/api/uploads/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uploaderName: uploaderName.trim() || undefined,
            items: completedItems,
          }),
        })

        const completeResult = (await completeResponse.json()) as {
          ok: boolean
          message?: string
        }

        if (!completeResponse.ok || !completeResult.ok) {
          throw new Error(completeResult.message ?? copy.finalizeFailed)
        }
      }

      setFeedback({
        type: hadError ? 'error' : 'success',
        text: hadError ? copy.failed : copy.done,
      })
    } catch (error) {
      const text = error instanceof Error ? error.message : copy.failed
      setFeedback({ type: 'error', text })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Reveal className="wi-section wi-section-upload px-5 py-12 sm:px-8 sm:py-14">
      <section id="guest-upload" className="wi-upload space-y-6">
        <h2 className="wi-title wi-upload-title section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>
        <div className="space-y-2 text-center">
          <p className="wi-upload-description text-base leading-relaxed text-[var(--muted)]">{copy.description}</p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.privacyNotice}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="wi-upload-open-button mx-auto flex min-w-[220px] items-center justify-center rounded-xl border border-[var(--line)] bg-white px-4 py-4 text-base font-medium text-[var(--foreground)]"
        >
          {copy.openModal}
        </button>
      </section>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={copy.heading} closeLabel={copy.closeModal}>
        <div className="wi-upload-form space-y-4">
          <label className="wi-upload-field block text-sm text-[var(--muted)]">
            {copy.uploaderName}
            <input
              value={uploaderName}
              onChange={(event) => setUploaderName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              maxLength={40}
            />
          </label>

          <label className="wi-upload-field block text-sm text-[var(--muted)]">
            {copy.fileInput}
            <input
              type="file"
              accept={uploadConstraints.allowedMimeTypes.join(',')}
              multiple
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
              onChange={(event) => {
                appendFiles(event.target.files)
                event.currentTarget.value = ''
              }}
            />
          </label>

          <div className="space-y-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
            <p className="wi-upload-helper text-sm text-[var(--foreground)]">{copy.helper || allowedUploadMimeTypeLabel}</p>
            <p className="text-xs text-[var(--muted)]">{limitLabel}</p>
            <p className="text-xs text-[var(--muted)]">{copy.privacyNotice}</p>
          </div>

          {selectionErrors.length > 0 && (
            <ul className="space-y-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
              {selectionErrors.map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <ul className="wi-upload-list space-y-2">
              {items.map((item) => (
                <li key={item.id} className="wi-upload-item rounded-xl border border-[var(--line)] p-2">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
                      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.file.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {(item.file.size / 1024 / 1024).toFixed(2)}MB
                      </p>

                      <div className="wi-upload-progress-track mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
                        <div
                          className={`wi-upload-progress-fill h-full rounded-full ${
                            item.status === 'error'
                              ? 'bg-rose-400'
                              : item.status === 'success'
                                ? 'bg-emerald-500'
                                : 'bg-[var(--accent)]'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                      {item.error && <p className="mt-1 text-xs text-rose-500">{item.error}</p>}
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end gap-2">
                    {item.status === 'error' && (
                      <button
                        type="button"
                        onClick={() => startUpload([item.id])}
                        className="wi-upload-retry rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground)]"
                      >
                        {copy.retry}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="wi-upload-remove rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground)]"
                    >
                      {copy.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {feedback && (
            <p className={`wi-upload-feedback text-sm ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {feedback.text}
            </p>
          )}

          <button
            type="button"
            disabled={!hasUploadable || isUploading}
            onClick={() => startUpload()}
            className="wi-upload-submit w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? copy.uploading : copy.submit}
          </button>
        </div>
      </Modal>
    </Reveal>
  )
}
