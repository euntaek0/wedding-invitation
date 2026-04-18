'use client'

import { useMemo, useState } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { Modal } from '@/components/ui/modal'
import type { AttendanceStatus, FamilySide, MealAttendance } from '@/types/rsvp'

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

  const canSubmit = useMemo(() => {
    return values.name.trim().length > 0 && values.phone.trim().length > 0
  }, [values.name, values.phone])

  const onInputChange = <K extends keyof RsvpFormValues>(key: K, value: RsvpFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const onAttendanceChange = (attendance: AttendanceStatus) => {
    setValues((prev) => ({
      ...prev,
      attendance,
      attendeeCount: attendance === 'attending' ? Math.max(prev.attendeeCount, 1) : 0,
    }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        ...values,
        message: values.message.trim(),
      }

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { ok: boolean; message: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || copy.error)
      }

      setFeedback({ type: 'success', text: copy.success })
      setValues(initialValues)
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.error
      setFeedback({ type: 'error', text: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="rsvp" className="space-y-6">
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
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm text-[var(--muted)]">
            {copy.name}
            <input
              value={values.name}
              onChange={(event) => onInputChange('name', event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              autoComplete="name"
              required
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.phone}
            <input
              value={values.phone}
              onChange={(event) => onInputChange('phone', event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              autoComplete="tel"
              required
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.side}
            <select
              value={values.side}
              onChange={(event) => onInputChange('side', event.target.value as FamilySide)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              <option value="groom">{copy.sideOptions.groom}</option>
              <option value="bride">{copy.sideOptions.bride}</option>
            </select>
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.attendance}
            <select
              value={values.attendance}
              onChange={(event) => onAttendanceChange(event.target.value as AttendanceStatus)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              <option value="attending">{copy.attendanceOptions.attending}</option>
              <option value="notAttending">{copy.attendanceOptions.notAttending}</option>
            </select>
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.attendeeCount}
            <input
              type="number"
              min={values.attendance === 'attending' ? 1 : 0}
              max={20}
              value={values.attendeeCount}
              onChange={(event) =>
                onInputChange('attendeeCount', Number(event.target.value || 0))
              }
              disabled={values.attendance !== 'attending'}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] disabled:bg-[var(--surface-soft)] disabled:text-[var(--muted)]"
            />
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.meal}
            <select
              value={values.meal}
              onChange={(event) => onInputChange('meal', event.target.value as MealAttendance)}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              <option value="yes">{copy.mealOptions.yes}</option>
              <option value="no">{copy.mealOptions.no}</option>
            </select>
          </label>

          <label className="block text-sm text-[var(--muted)]">
            {copy.message}
            <textarea
              value={values.message}
              onChange={(event) => onInputChange('message', event.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              maxLength={300}
            />
          </label>

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
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </button>
        </form>
      </Modal>
    </Reveal>
  )
}
