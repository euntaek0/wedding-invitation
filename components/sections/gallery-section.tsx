"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { moodGallerySections, photoAssets } from "@/lib/photos";
import type { Language } from "@/types/language";

type GalleryCopy = {
  heading: string;
  description: string;
  close: string;
  next: string;
  prev: string;
};

interface GallerySectionProps {
  language: Language;
  copy: GalleryCopy;
}

type Photo = (typeof photoAssets)[number];

export function GallerySection({ language, copy }: GallerySectionProps) {
  const [activeByGroup, setActiveByGroup] = useState<Record<string, number>>({});
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null);
  const stripRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lightboxTouchStart = useRef<number | null>(null);

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

  const setActive = (groupId: string, nextIndex: number) => {
    setActiveByGroup((prev) => ({ ...prev, [groupId]: nextIndex }));
  };

  const onStripScroll = (groupId: string, photos: Photo[]) => {
    const strip = stripRefs.current[groupId];
    if (!strip) return;

    const stripCenter = strip.getBoundingClientRect().left + strip.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    const nodes = Array.from(strip.querySelectorAll<HTMLElement>("[data-slide-index]"));
    for (const node of nodes) {
      const index = Number(node.dataset.slideIndex ?? 0);
      const rect = node.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - stripCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    if (nearestIndex >= 0 && nearestIndex < photos.length) {
      setActive(groupId, nearestIndex);
    }
  };

  const openLightbox = (photos: Photo[], index: number) => {
    setLightbox({ photos, index });
  };

  const closeLightbox = () => setLightbox(null);

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
        <section id="gallery" className="wi-gallery space-y-10">
          {groupedPhotos.map((group) => {
            const activeIndex = activeByGroup[group.id] ?? 0;

            return (
              <article key={group.id} className="wi-gallery-group space-y-4">
                <div
                  ref={(node) => {
                    stripRefs.current[group.id] = node;
                  }}
                  className="wi-gallery-strip no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12%] pb-2 scroll-smooth sm:-mx-8 sm:px-[16%]"
                  onScroll={() => onStripScroll(group.id, group.photos)}
                >
                  {group.photos.map((photo, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        data-slide-index={index}
                        onClick={() => openLightbox(group.photos, index)}
                        className={`wi-gallery-slide relative shrink-0 snap-center overflow-hidden border border-white/60 bg-white shadow-[0_14px_26px_rgba(17,24,39,0.14)] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${
                          isActive ? "w-[76%] scale-100 opacity-100" : "w-[70%] scale-[0.94] opacity-45"
                        }`}
                        aria-label={language === "ko" ? `${index + 1}번 사진 크게 보기` : `Open photo ${index + 1}`}
                      >
                        <Image
                          src={`/imgs/${photo.file}`}
                          alt="웨딩 갤러리 사진"
                          width={photo.width}
                          height={photo.height}
                          className="h-[440px] w-full object-cover sm:h-[520px]"
                          sizes="(max-width: 768px) 76vw, 52vw"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      </Reveal>

      {lightbox ? (
        <div
          className="wi-gallery-lightbox fixed inset-0 z-50 bg-black/86 backdrop-blur-[2px] transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={(event) => onLightboxTouchStart(event.touches[0]?.clientX ?? 0)}
          onTouchEnd={(event) => onLightboxTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <div
            className="wi-gallery-lightbox-inner relative mx-auto flex h-full max-w-[980px] items-center justify-center px-4 py-10"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={lightbox.photos[lightbox.index].id}
              src={`/imgs/${lightbox.photos[lightbox.index].file}`}
              alt="확대된 웨딩 사진"
              width={lightbox.photos[lightbox.index].width}
              height={lightbox.photos[lightbox.index].height}
              className="max-h-[84vh] w-auto max-w-full animate-[wiLightboxZoomIn_260ms_ease]"
              sizes="90vw"
              priority
            />

            <button
              type="button"
              onClick={closeLightbox}
              className="wi-gallery-lightbox-close absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-xl leading-none text-[#4f5867] shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
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

