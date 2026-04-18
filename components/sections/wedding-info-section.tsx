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
  const dateText = language === 'ko' ? weddingContent.date.koFull : weddingContent.date.enFull
  const relationTokens = ['의 장남', '의 딸']
  const labelClass =
    language === 'ko'
      ? 'text-sm tracking-[0.06em] text-[var(--muted)]'
      : 'text-sm uppercase tracking-[0.12em] text-[var(--muted)]'

  const renderParentSentence = (sentence: string) => {
    if (language !== 'ko') {
      return sentence
    }

    const parts = sentence.split(/(의 장남|의 딸)/g)

    return parts.map((part, index) =>
      relationTokens.includes(part) ? (
        <span key={`${part}-${index}`} className="text-[#8f8385]">
          {part}
        </span>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    )
  }

  return (
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="information" className="space-y-7">
        <h2 className="section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="space-y-9 text-center">
          <div className="space-y-3">
            <p className={labelClass}>{copy.parentHeading}</p>
            <p className="text-base leading-relaxed text-[var(--foreground)]">
              {renderParentSentence(weddingContent.parents[language].groom)}
            </p>
            <p className="text-base leading-relaxed text-[var(--foreground)]">
              {renderParentSentence(weddingContent.parents[language].bride)}
            </p>
          </div>

          <div className="space-y-3 border-y border-[var(--line)] py-8">
            <p className={labelClass}>{copy.dateHeading}</p>
            <p className="text-base leading-relaxed text-[var(--foreground)]">{dateText}</p>
            <p className={`pt-2 ${labelClass}`}>{copy.venueHeading}</p>
            <p className="text-base leading-relaxed text-[var(--foreground)]">
              {weddingContent.venue.name}
            </p>
            <p className="text-sm leading-relaxed text-[#8e8284]">
              {weddingContent.venue.address}
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
