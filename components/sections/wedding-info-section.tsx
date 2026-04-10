import { Reveal } from '@/components/ui/reveal'
import { weddingContent } from '@/content/invitation'
import type { Language } from '@/types/language'

type InfoCopy = {
  heading: string
  groomLabel: string
  brideLabel: string
  parentHeading: string
  dateHeading: string
  venueHeading: string
}

interface WeddingInfoSectionProps {
  language: Language
  copy: InfoCopy
}

export function WeddingInfoSection({ language, copy }: WeddingInfoSectionProps) {
  return (
    <Reveal className="border-t border-[var(--line)] px-4 py-8 sm:px-6">
      <section id="information" className="space-y-4">
        <h2 className="section-title text-center text-[1.55rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
              {copy.groomLabel}
            </p>
            <p className="mt-1 text-base font-medium text-[var(--foreground)]">
              {language === 'ko' ? '구은성' : 'Gu Eunseong'}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {weddingContent.parents[language].groom}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
              {copy.brideLabel}
            </p>
            <p className="mt-1 text-base font-medium text-[var(--foreground)]">
              {language === 'ko' ? '김예은' : 'Kim Yeeun'}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {weddingContent.parents[language].bride}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">{copy.dateHeading}</p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {language === 'ko'
                ? weddingContent.date.koFull
                : weddingContent.date.enFull}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">{copy.venueHeading}</p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {weddingContent.venue.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{weddingContent.venue.address}</p>
          </article>
        </div>
      </section>
    </Reveal>
  )
}
