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
      'mt-1 w-full rounded-xl border px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]'

    if (disabled) {
      return `${base} border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] disabled:cursor-not-allowed`
    }

    return `${base} ${fieldErrors[field] ? 'border-rose-300 focus:border-rose-400' : 'border-[var(--line)]'}`
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
          className="wi-rsvp-open-button mx-auto flex min-w-[220px] items-center justify-center rounded-xl border border-[var(--line)] bg-white px-4 py-4 text-base font-medium text-[var(--foreground)]"
        >
          {copy.openModal}
        </button>
      </section>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title={copy.heading} closeLabel={copy.closeModal}>
        <form onSubmit={onSubmit} className="wi-rsvp-form space-y-4">
          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.name}
            <input
              value={values.name}
              onChange={(event) => onInputChange('name', event.target.value)}
              className={getFieldClassName('name')}
              autoComplete="name"
              required
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-500">{fieldErrors.name}</p>}
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.phone}
            <input
              value={values.phone}
              onChange={(event) => onInputChange('phone', event.target.value)}
              className={getFieldClassName('phone')}
              autoComplete="tel"
              required
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-rose-500">{fieldErrors.phone}</p>}
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.side}
            <select
              value={values.side}
              onChange={(event) => onInputChange('side', event.target.value as FamilySide)}
              className={getFieldClassName('side')}
            >
              <option value="groom">{copy.sideOptions.groom}</option>
              <option value="bride">{copy.sideOptions.bride}</option>
            </select>
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.attendance}
            <select
              value={values.attendance}
              onChange={(event) => onAttendanceChange(event.target.value as AttendanceStatus)}
              className={getFieldClassName('attendance')}
            >
              <option value="attending">{copy.attendanceOptions.attending}</option>
              <option value="notAttending">{copy.attendanceOptions.notAttending}</option>
            </select>
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.attendeeCount}
            <input
              type="number"
              min={values.attendance === 'attending' ? 1 : 0}
              max={20}
              value={values.attendeeCount}
              onChange={(event) => onInputChange('attendeeCount', Number(event.target.value || 0))}
              disabled={values.attendance !== 'attending'}
              className={getFieldClassName('attendeeCount', values.attendance !== 'attending')}
            />
            {fieldErrors.attendeeCount && (
              <p className="mt-1 text-xs text-rose-500">{fieldErrors.attendeeCount}</p>
            )}
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.meal}
            <select
              value={values.meal}
              onChange={(event) => onInputChange('meal', event.target.value as MealAttendance)}
              disabled={values.attendance !== 'attending'}
              className={getFieldClassName('meal', values.attendance !== 'attending')}
            >
              <option value="yes">{copy.mealOptions.yes}</option>
              <option value="no">{copy.mealOptions.no}</option>
            </select>
          </label>

          <label className="wi-rsvp-field block text-sm text-[var(--muted)]">
            {copy.message}
            <textarea
              value={values.message}
              onChange={(event) => onInputChange('message', event.target.value)}
              className={getFieldClassName('message')}
              maxLength={300}
            />
          </label>

          {feedback && (
            <p className={`wi-rsvp-feedback text-sm ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {feedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="wi-rsvp-submit w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </button>
        </form>
      </Modal>
    </Reveal>
  )
}
