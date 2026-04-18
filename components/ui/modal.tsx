'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, closeLabel, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted || !open) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="section-title text-xl text-[var(--foreground)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="wi-btn-secondary rounded-full px-3 py-1 text-xs text-[var(--muted)]"
          >
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
