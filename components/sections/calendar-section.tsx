'use client'

import { useMemo } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { buildJune2026Matrix, getCountdownMessage } from '@/lib/date'
import type { Language } from '@/types/language'

type CalendarCopy = {
  heading: string
  caption: string
  ddayPrefix: string
  ddaySuffix: string
  ddayDone: string
  ddayPassed: string
}

interface CalendarSectionProps {
  language: Language
  copy: CalendarCopy
}

const dayLabels: Record<Language, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export function CalendarSection({ language, copy }: CalendarSectionProps) {
  const cells = useMemo(() => buildJune2026Matrix(), [])
  const countdown = useMemo(() => getCountdownMessage(language), [language])

  return (
    <Reveal className="border-t border-[var(--line)] px-4 py-8 sm:px-6">
      <section id="calendar" className="space-y-4">
        <h2 className="section-title text-center text-[1.55rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <p className="mb-4 text-center text-sm text-[var(--muted)]">{copy.caption}</p>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--muted)]">
            {dayLabels[language].map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}

            {cells.map((day, idx) => {
              const isWeddingDay = day === 6

              return (
                <div
                  key={`${day}-${idx}`}
                  className={`rounded-lg py-2 text-sm ${
                    isWeddingDay
                      ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
                      : 'text-[var(--foreground)]'
                  }`}
                >
                  {day ?? ''}
                </div>
              )
            })}
          </div>

          <p className="mt-4 text-center text-sm font-medium text-[var(--accent-strong)]">
            {countdown.startsWith('D-')
              ? `${copy.ddayPrefix}${countdown}${copy.ddaySuffix}`
              : countdown}
          </p>
        </div>
      </section>
    </Reveal>
  )
}
