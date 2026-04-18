'use client'

import { useState } from 'react'
import { Reveal } from '@/components/ui/reveal'
import { siteConfig } from '@/lib/site-config'

type VenueCopy = {
  heading: string
  subheading: string
  addressLabel: string
  naver: string
  kakao: string
  mapHint: string
}

type NavCopy = {
  copyAddress: string
  copied: string
}

interface VenueSectionProps {
  copy: VenueCopy
  navCopy: NavCopy
}

export function VenueSection({ copy, navCopy }: VenueSectionProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.venueAddress)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1400)
    } catch {
      setIsCopied(false)
    }
  }

  return (
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="venue" className="space-y-6">
        <h2 className="section-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div
            className="relative h-44 bg-[var(--surface-soft)]"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(221,143,157,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(221,143,157,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              꽃재교회
            </div>
            <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs text-[var(--muted)]">
              {copy.mapHint}
            </p>
          </div>

          <div className="space-y-4 p-6">
            <p className="text-base font-medium text-[var(--foreground)]">{copy.subheading}</p>
            <p className="text-base text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">{copy.addressLabel}</span>
            </p>
            <p className="text-xs leading-relaxed text-[#8e8284]">{siteConfig.venueAddress}</p>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={siteConfig.naverMapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-center text-xs font-medium text-[var(--foreground)]"
              >
                {copy.naver}
              </a>
              <a
                href={siteConfig.kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-center text-xs font-medium text-[var(--foreground)]"
              >
                {copy.kakao}
              </a>
              <button
                type="button"
                onClick={copyAddress}
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--foreground)]"
              >
                {isCopied ? navCopy.copied : navCopy.copyAddress}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
