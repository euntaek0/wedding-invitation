import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { weddingContent } from '@/content/invitation'
import { featuredPhotos } from '@/lib/photos'
import type { Language } from '@/types/language'

type HeroCopy = {
  title: string
  subtitle: string
  dateLine: string
  venueLine: string
}

interface HeroSectionProps {
  language: Language
  copy: HeroCopy
}

export function HeroSection({ language, copy }: HeroSectionProps) {
  const [heroImage, ...secondaryImages] = featuredPhotos

  return (
    <Reveal className="px-4 pb-8 pt-6 sm:px-6">
      <section id="hero" className="space-y-5">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          {language === 'ko' ? 'Wedding Invitation' : 'Wedding Invitation'}
        </p>

        <div className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface-soft)]">
          <Image
            src={`/imgs/${heroImage.file}`}
            alt="신랑 신부 웨딩 사진"
            width={heroImage.width}
            height={heroImage.height}
            priority
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 460px"
          />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="section-title text-[2rem] leading-[1.18] text-[var(--foreground)]">
            {weddingContent.names[language]}
          </h1>
          <p className="text-sm text-[var(--muted)]">{copy.title}</p>
          <p className="text-sm text-[var(--muted)]">{copy.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {secondaryImages.slice(0, 2).map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
            >
              <Image
                src={`/imgs/${photo.file}`}
                alt="웨딩 스냅 컷"
                width={photo.width}
                height={photo.height}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 50vw, 220px"
              />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-4 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">{copy.dateLine}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{copy.venueLine}</p>
        </div>
      </section>
    </Reveal>
  )
}
