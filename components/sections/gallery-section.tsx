import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { moodGallerySections, photoAssets } from '@/lib/photos'
import type { Language } from '@/types/language'

type GalleryCopy = {
  heading: string
  description: string
}

interface GallerySectionProps {
  language: Language
  copy: GalleryCopy
}

export function GallerySection({ language, copy }: GallerySectionProps) {
  return (
    <Reveal className="border-t border-[var(--line)] px-4 py-8 sm:px-6">
      <section id="gallery" className="space-y-6">
        <h2 className="section-title text-center text-[1.55rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>
        <p className="text-center text-sm text-[var(--muted)]">{copy.description}</p>

        {moodGallerySections.map((group) => {
          const cover = photoAssets.find((photo) => photo.id === group.coverId)
          const photos = group.photoIds
            .map((id) => photoAssets.find((photo) => photo.id === id))
            .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo))

          if (!cover || photos.length === 0) {
            return null
          }

          return (
            <article key={group.id} className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                <Image
                  src={`/imgs/${cover.file}`}
                  alt="대표 웨딩 사진"
                  width={cover.width}
                  height={cover.height}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 460px"
                />
              </div>

              <div className="px-1">
                <h3 className="section-title text-2xl text-[var(--foreground)]">
                  {language === 'ko' ? group.titleKo : group.titleEn}
                </h3>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {language === 'ko' ? group.subtitleKo : group.subtitleEn}
                </p>
              </div>

              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="flex min-w-max gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="w-[138px] flex-none overflow-hidden rounded-xl border border-[var(--line)] bg-white"
                    >
                      <Image
                        src={`/imgs/${photo.file}`}
                        alt="웨딩 스냅"
                        width={photo.width}
                        height={photo.height}
                        className="h-[190px] w-full object-cover"
                        loading="lazy"
                        sizes="138px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </Reveal>
  )
}
