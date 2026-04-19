"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { getPhotoSrc, getPhotoThumbSrc, photoAssets } from "@/lib/photos";

type Photo = (typeof photoAssets)[number];

function GalleryLightbox({
  photos,
  index,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-[2px] transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative mx-auto flex h-full max-w-[980px] items-center justify-center px-4 py-10">
        <Image
          src={getPhotoSrc(photos[index].file)}
          alt="확대된 갤러리 사진"
          width={photos[index].width}
          height={photos[index].height}
          className="max-h-[86vh] w-auto max-w-full animate-[wiLightboxZoomIn_220ms_ease]"
          sizes="90vw"
          priority
          onClick={(event) => event.stopPropagation()}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-3xl leading-none text-white/92 transition hover:opacity-80"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function GalleryPageClient({ language }: { language: "ko" | "en" }) {
  const router = useRouter();
  const columns = useMemo(() => {
    const source = [...photoAssets];

    const landscape: Photo[] = [];
    const portrait: Photo[] = [];
    const square: Photo[] = [];

    source.forEach((photo) => {
      if (photo.width > photo.height) {
        landscape.push(photo);
        return;
      }

      if (photo.height > photo.width) {
        portrait.push(photo);
        return;
      }

      square.push(photo);
    });

    const takeByType = (type: "landscape" | "portrait") => {
      if (type === "landscape") {
        if (landscape.length) return landscape.shift() as Photo;
        if (portrait.length) return portrait.shift() as Photo;
        if (square.length) return square.shift() as Photo;
        return null;
      }
      if (portrait.length) return portrait.shift() as Photo;
      if (landscape.length) return landscape.shift() as Photo;
      if (square.length) return square.shift() as Photo;
      return null;
    };

    const cols: Photo[][] = [[], [], []];

    // First visible row is fixed: 1st col landscape, 2nd col portrait, 3rd col landscape.
    const firstRowPattern: Array<"landscape" | "portrait" | "landscape"> = [
      "landscape",
      "portrait",
      "landscape",
    ];
    firstRowPattern.forEach((type, index) => {
      const picked = takeByType(type);
      if (picked) cols[index].push(picked);
    });

    let colIndex = 0;
    while (landscape.length || portrait.length || square.length) {
      const col = cols[colIndex];
      const prefersLandscape = col.length % 2 === 0;
      const picked = takeByType(prefersLandscape ? "landscape" : "portrait");
      if (picked) col.push(picked);
      colIndex = (colIndex + 1) % cols.length;
    }

    return cols;
  }, []);
  const photos = useMemo(() => columns.flat(), [columns]);
  const photoIndexById = useMemo(() => new Map(photos.map((photo, index) => [photo.id, index])), [photos]);
  const appearOrderById = useMemo(() => {
    const order = new Map<string, number>();
    const maxRows = Math.max(...columns.map((col) => col.length), 0);
    let seq = 0;

    // Top-to-bottom visual order: row 0 (col 1->3), row 1 (col 1->3), ...
    for (let row = 0; row < maxRows; row += 1) {
      for (let col = 0; col < columns.length; col += 1) {
        const photo = columns[col]?.[row];
        if (!photo) continue;
        order.set(photo.id, seq);
        seq += 1;
      }
    }

    return order;
  }, [columns]);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const step = (delta: number) => {
    if (lightbox == null || photos.length === 0) return;
    setLightbox((lightbox + delta + photos.length) % photos.length);
  };

  const onBackClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(language === "en" ? "/?lang=en" : "/");
  };

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[680px] space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="section-title text-[1.5rem] text-[#8f7f72]">Gallery</h1>
          <a
            href={language === "en" ? "/?lang=en" : "/"}
            onClick={onBackClick}
            className="text-sm !text-[#8c9098] transition"
          >
            {language === "ko" ? "돌아가기" : "Back"}
          </a>
        </div>

        <section className="wi-gallery-columns grid grid-cols-3 gap-2.5">
          {columns.map((col, colIdx) => (
            <div key={`col-${colIdx}`} className="space-y-2.5">
              {col.map((photo) => (
                <button
                  type="button"
                  key={photo.id}
                  className="wi-gallery-tile-enter block w-full overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
                  style={{
                    animationDelay: `${(appearOrderById.get(photo.id) ?? 0) * 130}ms`,
                  }}
                  onClick={() => setLightbox(photoIndexById.get(photo.id) ?? 0)}
                >
                  <img
                    src={getPhotoThumbSrc(photo.file)}
                    alt="웨딩 아카이브 사진"
                    width={photo.width}
                    height={photo.height}
                    className="h-auto w-full bg-[var(--surface-soft)] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          ))}
        </section>
      </div>

      {lightbox != null ? (
        <div
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current == null) return;
            const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
            const diff = endX - touchStartX.current;
            if (Math.abs(diff) > 28) {
              step(diff < 0 ? 1 : -1);
            }
            touchStartX.current = null;
          }}
        >
          <GalleryLightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />
        </div>
      ) : null}
    </main>
  );
}
