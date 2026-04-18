'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { Modal } from '@/components/ui/modal'
import type { UploadTarget } from '@/types/upload'

type UploadCopy = {
  heading: string
  description: string
  openModal: string
  closeModal: string
  uploaderName: string
  fileInput: string
  helper: string
  submit: string
  uploading: string
  done: string
  failed: string
  retry: string
  remove: string
}

interface GuestUploadSectionProps {
  copy: UploadCopy
}

type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
  status: UploadStatus
  progress: number
  key?: string
  url?: string
  error?: string
}

const maxFiles = 10
const maxFileSize = 12 * 1024 * 1024

function createUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
      if (!event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network upload error'))

    if (target.method === 'POST') {
      const form = new FormData()
      if (target.fields) {
        Object.entries(target.fields).forEach(([key, value]) => {
          form.append(key, value)
        })
      }
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
  const itemsRef = useRef<UploadItem[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const hasUploadable = useMemo(() => {
    return items.some((item) => item.status === 'ready' || item.status === 'error')
  }, [items])

  const appendFiles = (files: FileList | null) => {
    if (!files) return

    const remaining = Math.max(maxFiles - items.length, 0)
    const incoming = Array.from(files).slice(0, remaining)

    const nextItems: UploadItem[] = []
    for (const file of incoming) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > maxFileSize) continue

      nextItems.push({
        id: createUploadId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'ready',
        progress: 0,
      })
    }

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
    if (isUploading) return

    const candidates = items.filter((item) => {
      if (selectedIds && !selectedIds.includes(item.id)) return false
      return item.status === 'ready' || item.status === 'error'
    })

    if (candidates.length === 0) return

    setIsUploading(true)
    setFeedback(null)

    try {
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
      const successful: Array<{
        id: string
        key: string
        name: string
        type: string
        size: number
        url: string
      }> = []
      let hadError = false

      for (const candidate of candidates) {
        const target = targetMap.get(candidate.id)

        if (!target) {
          hadError = true
          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? { ...item, status: 'error', error: 'Missing upload target' }
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

          const absoluteUrl = new URL(
            target.publicUrl ?? target.url,
            window.location.origin,
          ).toString()

          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? {
                    ...item,
                    status: 'success',
                    progress: 100,
                    key: target.key,
                    url: absoluteUrl,
                  }
                : item,
            ),
          )

          successful.push({
            id: candidate.id,
            key: target.key,
            name: candidate.file.name,
            type: candidate.file.type,
            size: candidate.file.size,
            url: absoluteUrl,
          })
        } catch (error) {
          hadError = true
          const message = error instanceof Error ? error.message : 'Upload failed'
          setItems((prev) =>
            prev.map((item) =>
              item.id === candidate.id
                ? { ...item, status: 'error', error: message }
                : item,
            ),
          )
        }
      }

      if (successful.length > 0) {
        const completeResponse = await fetch('/api/uploads/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uploaderName: uploaderName.trim() || undefined,
            items: successful,
          }),
        })

        const completeResult = (await completeResponse.json()) as {
          ok: boolean
          message?: string
        }

        if (!completeResponse.ok || !completeResult.ok) {
          throw new Error(completeResult.message ?? copy.failed)
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
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="guest-upload" className="space-y-6">
        <h2 className="section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>
        <p className="text-center text-base leading-relaxed text-[var(--muted)]">{copy.description}</p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-4 text-base font-medium text-[var(--foreground)]"
        >
          {copy.openModal}
        </button>
      </section>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={copy.heading}
        closeLabel={copy.closeModal}
      >
        <div className="space-y-3">
          <label className="block text-sm text-[var(--muted)]">
            {copy.uploaderName}
            <input
              value={uploaderName}
              onChange={(event) => setUploaderName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              maxLength={40}
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.fileInput}
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
              onChange={(event) => {
                appendFiles(event.target.files)
                event.currentTarget.value = ''
              }}
            />
          </label>

          <p className="text-xs text-[var(--muted)]">{copy.helper}</p>

          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="rounded-xl border border-[var(--line)] p-2">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 overflow-hidden bg-[var(--surface-soft)]">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {(item.file.size / 1024 / 1024).toFixed(2)}MB
                      </p>

                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
                        <div
                          className={`h-full rounded-full ${
                            item.status === 'error'
                              ? 'bg-rose-400'
                              : item.status === 'success'
                                ? 'bg-emerald-500'
                                : 'bg-[var(--accent)]'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                      {item.error && (
                        <p className="mt-1 text-xs text-rose-500">{item.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end gap-2">
                    {item.status === 'error' && (
                      <button
                        type="button"
                        onClick={() => startUpload([item.id])}
                        className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground)]"
                      >
                        {copy.retry}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground)]"
                    >
                      {copy.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {feedback && (
            <p
              className={`text-sm ${
                feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <button
            type="button"
            disabled={!hasUploadable || isUploading}
            onClick={() => startUpload()}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? copy.uploading : copy.submit}
          </button>
        </div>
      </Modal>
    </Reveal>
  )
}
