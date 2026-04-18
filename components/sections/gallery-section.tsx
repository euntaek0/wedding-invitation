import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { moodGallerySections, photoAssets } from "@/lib/photos";
import type { Language } from "@/types/language";

type GalleryCopy = {
  heading: string;
  description: string;
};

interface GallerySectionProps {
  language: Language;
  copy: GalleryCopy;
}

export function GallerySection({ language, copy }: GallerySectionProps) {
  return (
    <Reveal className="wi-section wi-section-gallery border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="gallery" className="wi-gallery space-y-10">
        {moodGallerySections.map((group) => {
          const cover = photoAssets.find((photo) => photo.id === group.coverId);
          const photos = group.photoIds
            .map((id) => photoAssets.find((photo) => photo.id === id))
            .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

          if (!cover || photos.length === 0) {
            return null;
          }

          return (
            <article key={group.id} className="wi-gallery-group space-y-3">
              <div className="wi-gallery-cover overflow-hidden">
                <Image
                  src={`/imgs/${cover.file}`}
                  alt="대표 웨딩 사진"
                  width={cover.width}
                  height={cover.height}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 460px"
                />
              </div>

              <div className="wi-gallery-strip -mx-1 overflow-x-auto px-1 pb-1">
                <div className="wi-gallery-strip-track flex min-w-max gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="wi-gallery-strip-item w-[138px] flex-none overflow-hidden">
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
          );
        })}
      </section>
    </Reveal>
  );
}
