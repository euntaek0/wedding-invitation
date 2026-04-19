'use client'

import { useMemo, useState } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { Modal } from '@/components/ui/modal'
import type {
  AttendanceStatus,
  FamilySide,
  MealAttendance,
  RSVPApiResponse,
} from '@/types/rsvp'

type RsvpCopy = {
  heading: string
  description: string
  openModal: string
  closeModal: string
  name: string
  phone: string
  side: string
  attendance: string
  attendeeCount: string
  meal: string
  message: string
  sideOptions: {
    groom: string
    bride: string
  }
  attendanceOptions: {
    attending: string
    notAttending: string
  }
  mealOptions: {
    yes: string
    no: string
  }
  validation: {
    nameRequired: string
    phoneRequired: string
    phoneInvalid: string
    attendeeCountRequired: string
  }
  submit: string
  submitting: string
  success: string
  error: string
}

interface RsvpSectionProps {
  copy: RsvpCopy
}

interface RsvpFormValues {
  name: string
  phone: string
  side: FamilySide
  attendance: AttendanceStatus
  attendeeCount: number
  meal: MealAttendance
  message: string
}

const phonePattern = /^[0-9+\-()\s]+$/

const initialValues: RsvpFormValues = {
  name: '',
  phone: '',
  side: 'groom',
  attendance: 'attending',
  attendeeCount: 1,
  meal: 'yes',
  message: '',
}

export function RsvpSection({ copy }: RsvpSectionProps) {
  const [values, setValues] = useState<RsvpFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RsvpFormValues, string>>>({})

  const canSubmit = useMemo(() => {
    if (values.name.trim().length === 0 || values.phone.trim().length === 0) {
      return false
    }

    if (values.attendance === 'attending' && values.attendeeCount < 1) {
      return false
    }

    return true
  }, [values.attendance, values.attendeeCount, values.name, values.phone])

  const onInputChange = <K extends keyof RsvpFormValues>(key: K, value: RsvpFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev
      }

      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const onAttendanceChange = (attendance: AttendanceStatus) => {
    setValues((prev) => ({
      ...prev,
      attendance,
      attendeeCount: attendance === 'attending' ? Math.max(prev.attendeeCount, 1) : 0,
      meal: attendance === 'attending' ? 'yes' : 'no',
    }))

    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.attendeeCount
      delete next.meal
      return next
    })
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof RsvpFormValues, string>> = {}

    if (values.name.trim().length === 0) {
      nextErrors.name = copy.validation.nameRequired
    }

    if (values.phone.trim().length === 0) {
      nextErrors.phone = copy.validation.phoneRequired
    } else if (!phonePattern.test(values.phone.trim())) {
      nextErrors.phone = copy.validation.phoneInvalid
    }

    if (values.attendance === 'attending' && values.attendeeCount < 1) {
      nextErrors.attendeeCount = copy.validation.attendeeCountRequired
    }

    return nextErrors
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setFeedback({ type: 'error', text: copy.error })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)
    setFieldErrors({})

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          message: values.message.trim(),
        }),
      })

      const result = (await response.json()) as RSVPApiResponse

      if (!response.ok || !result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }

        throw new Error(result.message || copy.error)
      }

      setFeedback({ type: 'success', text: copy.success })
      setValues(initialValues)
      setFieldErrors({})
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.error
      setFeedback({ type: 'error', text: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldClassName = (field: keyof RsvpFormValues, disabled = false) => {
    const base =
      'w-full rounded-lg border px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]'

    if (disabled) {
      return `${base} border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] disabled:cursor-not-allowed`
    }

    return `${base} ${fieldErrors[field] ? 'border-rose-300 focus:border-rose-400' : 'border-[var(--line)]'}`
  }

  const getOptionButtonClass = (active: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-[0.95rem] font-medium transition ${
      active
        ? 'border-[#b8a89b] bg-[#c2b0a2] text-white shadow-[0_4px_10px_rgba(110,94,82,0.15)]'
        : 'border-[var(--line)] bg-white text-[var(--foreground)]'
    }`

  const getSideButtonClass = (active: boolean, side: FamilySide) => {
    if (!active) {
      return 'w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[0.95rem] font-medium text-[var(--foreground)] transition'
    }

    return side === 'groom'
      ? 'w-full rounded-lg border border-[#4d9bff] bg-white px-3 py-2 text-[0.95rem] font-medium text-[#4d9bff] shadow-[0_3px_8px_rgba(77,155,255,0.18)] transition'
      : 'w-full rounded-lg border border-[#ff8b9a] bg-white px-3 py-2 text-[0.95rem] font-medium text-[#ff8b9a] shadow-[0_3px_8px_rgba(255,139,154,0.18)] transition'
  }

  return (
    <Reveal className="wi-section wi-section-rsvp px-5 py-12 sm:px-8 sm:py-14">
      <section id="rsvp" className="wi-rsvp space-y-6">
        <h2 className="wi-title wi-rsvp-title section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>
        <p className="wi-rsvp-description mx-auto max-w-[300px] text-center text-base leading-relaxed text-[var(--muted)]">
          {copy.description}
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="wi-rsvp-open-button wi-btn-primary mx-auto flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-4 py-4 text-base font-medium"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
          </svg>
          <span>{copy.openModal}</span>
        </button>
      </section>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={copy.heading} closeLabel={copy.closeModal}>
        <form onSubmit={onSubmit} className="wi-rsvp-form space-y-4">
          <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[0.98rem] font-medium text-[var(--foreground)]">
                  {copy.side} <span className="text-rose-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onInputChange('side', 'groom')}
                    className={getSideButtonClass(values.side === 'groom', 'groom')}
                  >
                    {copy.sideOptions.groom}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInputChange('side', 'bride')}
                    className={getSideButtonClass(values.side === 'bride', 'bride')}
                  >
                    {copy.sideOptions.bride}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[0.98rem] font-medium text-[var(--foreground)]">
                  {copy.attendance} <span className="text-rose-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onAttendanceChange('attending')}
                    className={getOptionButtonClass(values.attendance === 'attending')}
                  >
                    {copy.attendanceOptions.attending}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAttendanceChange('notAttending')}
                    className={getOptionButtonClass(values.attendance === 'notAttending')}
                  >
                    {copy.attendanceOptions.notAttending}
                  </button>
                </div>
              </div>

              <label className="wi-rsvp-field block space-y-2">
                <span className="text-[0.98rem] font-medium text-[var(--foreground)]">
                  {copy.name} <span className="text-rose-500">*</span>
                </span>
                <input
                  value={values.name}
                  onChange={(event) => onInputChange('name', event.target.value)}
                  className={getFieldClassName('name')}
                  autoComplete="name"
                  required
                />
                {fieldErrors.name && <p className="text-xs text-rose-500">{fieldErrors.name}</p>}
              </label>

              <label className="wi-rsvp-field block space-y-2">
                <span className="text-[0.98rem] font-medium text-[var(--foreground)]">
                  {copy.phone} <span className="text-rose-500">*</span>
                </span>
                <input
                  value={values.phone}
                  onChange={(event) => onInputChange('phone', event.target.value)}
                  className={getFieldClassName('phone')}
                  autoComplete="tel"
                  required
                />
                {fieldErrors.phone && <p className="text-xs text-rose-500">{fieldErrors.phone}</p>}
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="wi-rsvp-field block space-y-0">
                  <span className="mb-1 block h-5 text-sm leading-5 text-[var(--muted)]">{copy.attendeeCount}</span>
                  <input
                    type="number"
                    min={values.attendance === 'attending' ? 1 : 0}
                    max={20}
                    value={values.attendeeCount}
                    onChange={(event) => onInputChange('attendeeCount', Number(event.target.value || 0))}
                    disabled={values.attendance !== 'attending'}
                    className={getFieldClassName('attendeeCount', values.attendance !== 'attending')}
                  />
                </label>

                <div className="space-y-0">
                  <p className="mb-1 block h-5 text-sm leading-5 text-[var(--muted)]">{copy.meal}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onInputChange('meal', 'yes' as MealAttendance)}
                      disabled={values.attendance !== 'attending'}
                      className={`${getOptionButtonClass(values.meal === 'yes')} inline-flex h-[38px] items-center justify-center leading-none`}
                    >
                      O
                    </button>
                    <button
                      type="button"
                      onClick={() => onInputChange('meal', 'no' as MealAttendance)}
                      disabled={values.attendance !== 'attending'}
                      className={`${getOptionButtonClass(values.meal === 'no')} inline-flex h-[38px] items-center justify-center leading-none`}
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>

              {fieldErrors.attendeeCount && <p className="text-xs text-rose-500">{fieldErrors.attendeeCount}</p>}

              <label className="wi-rsvp-field block space-y-2">
                <span className="text-sm text-[var(--muted)]">{copy.message}</span>
                <textarea
                  value={values.message}
                  onChange={(event) => onInputChange('message', event.target.value)}
                  className={getFieldClassName('message')}
                  maxLength={300}
                />
              </label>
            </div>
          </div>

          {feedback && (
            <p className={`wi-rsvp-feedback text-sm ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {feedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="wi-rsvp-submit w-full rounded-lg bg-[#c2c2c4] px-4 py-2 text-[0.95rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </button>
        </form>
      </Modal>
    </Reveal>
  )
}
