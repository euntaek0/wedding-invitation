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
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let enterTimer: number | null = null
    let closeTimer: number | null = null

    if (open) {
      setShouldRender(true)
      setIsVisible(false)
      enterTimer = window.setTimeout(() => {
        setIsVisible(true)
      }, 20)
    } else if (shouldRender) {
      setIsVisible(false)
      closeTimer = window.setTimeout(() => {
        setShouldRender(false)
      }, 240)
    }

    return () => {
      if (enterTimer) window.clearTimeout(enterTimer)
      if (closeTimer) window.clearTimeout(closeTimer)
    }
  }, [mounted, open, shouldRender])

  useEffect(() => {
    if (!shouldRender) return

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
  }, [shouldRender, onClose])

  if (!mounted || !shouldRender) {
    return null
  }

  return createPortal(
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 transition-colors duration-200 sm:p-6 ${
        isVisible ? 'bg-black/35' : 'bg-black/0'
      }`}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className={`max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition-all duration-240 ease-out ${
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.98] opacity-0'
        }`}
          onClick={(event) => event.stopPropagation()}
        >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="section-title text-xl text-[var(--foreground)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
