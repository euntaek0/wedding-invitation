"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/site-config";

type VenueCopy = {
  heading: string;
  subheading: string;
  addressLabel: string;
  naver: string;
  kakao: string;
  mapHint: string;
};

type NavCopy = {
  copyAddress: string;
  copied: string;
};

interface VenueSectionProps {
  copy: VenueCopy;
  navCopy: NavCopy;
}

export function VenueSection({ copy, navCopy }: VenueSectionProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.venueAddress);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1400);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Reveal className="wi-section wi-section-venue mx-auto max-w-[360px] px-5 py-12 sm:px-8 sm:py-14">
      <section id="venue" className="wi-venue space-y-6">
        <h2 className="wi-title wi-venue-title section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="wi-venue-map-card overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_10px_24px_rgba(25,32,45,0.10)]">
          <div
            className="wi-venue-map-canvas relative h-44 bg-[var(--surface-soft)]"
            style={{
              backgroundImage: "url('/map/map.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="wi-venue-map-hint absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs text-[var(--muted)]">
              {copy.mapHint}
            </p>
          </div>

          <div className="wi-venue-info space-y-4 p-6">
            <p className="wi-venue-name text-base font-medium text-[var(--foreground)]">{copy.subheading}</p>
            <p className="wi-venue-address-label text-base text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">{copy.addressLabel}</span>
            </p>
            <p className="wi-venue-address-detail wi-information-venue-address mr-auto max-w-[240px] text-left text-xs leading-relaxed text-[#8e8284]">
              {siteConfig.venueAddress}
            </p>

            <div className="wi-venue-actions grid grid-cols-3 gap-2">
              <a
                href={siteConfig.naverMapUrl}
                target="_blank"
                rel="noreferrer"
                className="wi-venue-action wi-venue-action-naver wi-btn-secondary inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-center text-[11px] font-normal !text-[var(--muted)] sm:text-xs"
              >
                <img
                  src="https://ssl.pstatic.net/static/maps/assets/icons/favicon.ico"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {copy.naver}
              </a>
              <a
                href={siteConfig.kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                className="wi-venue-action wi-venue-action-kakao wi-btn-secondary inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-center text-[11px] font-normal !text-[var(--muted)] sm:text-xs"
              >
                <img
                  src="https://place.map.kakao.com/favicon.ico"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 rounded-[3px]"
                  aria-hidden="true"
                />
                {copy.kakao}
              </a>
              <button
                type="button"
                onClick={copyAddress}
                className="wi-venue-action wi-venue-action-copy wi-btn-secondary inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[11px] font-normal !text-[var(--muted)] sm:text-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-[var(--muted)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a1 1 0 0 1 1-1h10" />
                </svg>
                {isCopied ? navCopy.copied : navCopy.copyAddress}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
