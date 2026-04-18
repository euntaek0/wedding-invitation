"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { moodGallerySections, photoAssets } from "@/lib/photos";
import type { Language } from "@/types/language";

type GalleryCopy = {
  heading: string;
  description: string;
  viewAll: string;
  close: string;
  next: string;
  prev: string;
};

interface GallerySectionProps {
  language: Language;
  copy: GalleryCopy;
  galleryHref: string;
}

type Photo = (typeof photoAssets)[number];

function GalleryTrack({
  groupId,
  photos,
  language,
  onOpen,
}: {
  groupId: string;
  photos: Photo[];
  language: Language;
  onOpen: (photos: Photo[], index: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="wi-gallery-carousel">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={`${groupId}-${photo.id}`}
                className="min-w-0 shrink-0 basis-[82%] px-1.5 sm:basis-[64%] sm:px-2"
              >
                <button
                  type="button"
                  onClick={() => onOpen(photos, index)}
                  className={`wi-gallery-slide relative w-full overflow-hidden shadow-[0_3px_6px_rgba(17,24,39,0.14)] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${
                    isActive ? "scale-100 opacity-100" : "scale-[0.94] opacity-45"
                  }`}
                  aria-label={language === "ko" ? `${index + 1}번 사진 크게 보기` : `Open photo ${index + 1}`}
                >
                  <img
                    src={`/imgs/${photo.file}`}
                    alt="웨딩 갤러리 사진"
                    width={photo.width}
                    height={photo.height}
                    className="h-[440px] w-full bg-[var(--surface-soft)] object-cover sm:h-[520px]"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GallerySection({ language, copy, galleryHref }: GallerySectionProps) {
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const lightboxTouchStart = useRef<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedPhotos = useMemo(
    () =>
      moodGallerySections
        .map((group) => {
          const photos = group.photoIds
            .map((id) => photoAssets.find((photo) => photo.id === id))
            .filter((photo): photo is Photo => Boolean(photo));

          return photos.length > 0 ? { id: group.id, photos } : null;
        })
        .filter((group): group is { id: string; photos: Photo[] } => Boolean(group)),
    [],
  );
  const primaryGroup = groupedPhotos[0] ?? null;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openLightbox = (photos: Photo[], index: number) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setLightbox({ photos, index });
    requestAnimationFrame(() => setLightboxVisible(true));
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setLightbox(null);
      closeTimerRef.current = null;
    }, 220);
  };

  const stepLightbox = (delta: number) => {
    if (!lightbox) return;
    const next = (lightbox.index + delta + lightbox.photos.length) % lightbox.photos.length;
    setLightbox({ ...lightbox, index: next });
  };

  const onLightboxTouchStart = (x: number) => {
    lightboxTouchStart.current = x;
  };

  const onLightboxTouchEnd = (x: number) => {
    if (!lightbox) return;
    const startX = lightboxTouchStart.current;
    if (startX == null) return;
    const diff = x - startX;
    if (Math.abs(diff) > 28) {
      stepLightbox(diff < 0 ? 1 : -1);
    }
    lightboxTouchStart.current = null;
  };

  return (
    <>
      <Reveal className="wi-section wi-section-gallery px-5 py-12 sm:px-8 sm:py-14">
        <section id="gallery" className="wi-gallery space-y-8">
          {primaryGroup ? (
            <article key={primaryGroup.id} className="wi-gallery-group space-y-4">
              <GalleryTrack
                groupId={primaryGroup.id}
                photos={primaryGroup.photos}
                language={language}
                onOpen={openLightbox}
              />
            </article>
          ) : null}
          <div className="flex justify-center pt-2">
            <Link
              href={galleryHref}
              className="wi-gallery-link wi-btn-secondary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm !text-[var(--muted)]"
            >
              {copy.viewAll}
            </Link>
          </div>
        </section>
      </Reveal>

      {lightbox ? (
        <div
          className={`wi-gallery-lightbox fixed inset-0 z-50 backdrop-blur-[2px] transition-opacity duration-200 ${
            lightboxVisible ? "bg-black/86 opacity-100" : "bg-black/86 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={(event) => onLightboxTouchStart(event.touches[0]?.clientX ?? 0)}
          onTouchEnd={(event) => onLightboxTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div
            className={`wi-gallery-lightbox-inner relative mx-auto flex h-full max-w-[980px] items-center justify-center px-4 py-10 transition-all duration-200 ${
              lightboxVisible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
            }`}
          >
            <Image
              key={lightbox.photos[lightbox.index].id}
              src={`/imgs/${lightbox.photos[lightbox.index].file}`}
              alt="확대된 웨딩 사진"
              width={lightbox.photos[lightbox.index].width}
              height={lightbox.photos[lightbox.index].height}
              className={`max-h-[84vh] w-auto max-w-full transition-all duration-200 ${
                lightboxVisible ? "scale-100 opacity-100" : "scale-[0.985] opacity-0"
              }`}
              sizes="90vw"
              priority
              onClick={(event) => event.stopPropagation()}
            />

            <button
              type="button"
              onClick={closeLightbox}
              onMouseDown={(event) => event.stopPropagation()}
              className="wi-gallery-lightbox-close absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center text-2xl leading-none text-white transition hover:opacity-80"
              aria-label={copy.close}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
