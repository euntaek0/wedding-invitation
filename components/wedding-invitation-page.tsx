'use client'

import { useEffect, useMemo, useState } from 'react'
import { invitationCopy } from '@/content/invitation'
import { CalendarSection } from '@/components/sections/calendar-section'
import { FooterSection } from '@/components/sections/footer-section'
import { GallerySection } from '@/components/sections/gallery-section'
import { GuestUploadSection } from '@/components/sections/guest-upload-section'
import { HeroSection } from '@/components/sections/hero-section'
import { InvitationSection } from '@/components/sections/invitation-section'
import { RsvpSection } from '@/components/sections/rsvp-section'
import { VenueSection } from '@/components/sections/venue-section'
import { WeddingInfoSection } from '@/components/sections/wedding-info-section'
import type { Language } from '@/types/language'

const languageStorageKey = 'wedding-invitation-language'

export function WeddingInvitationPage() {
  const [language, setLanguage] = useState<Language>('ko')

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey)
    if (saved === 'ko' || saved === 'en') {
      setLanguage(saved)
    }
  }, [])

  const copy = useMemo(() => invitationCopy[language], [language])

  const toggleLanguage = () => {
    const nextLanguage: Language = language === 'ko' ? 'en' : 'ko'
    setLanguage(nextLanguage)
    window.localStorage.setItem(languageStorageKey, nextLanguage)
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="flex justify-end px-4 pt-4 sm:px-6 sm:pt-5">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`Toggle language (${language})`}
            className="text-xs font-medium text-[#9f9496] transition hover:text-[#837779]"
          >
            {copy.nav.language}
          </button>
        </div>

        <HeroSection language={language} copy={copy.hero} />
        <InvitationSection copy={copy.invitation} />
        <WeddingInfoSection language={language} copy={copy.information} />
        <CalendarSection language={language} copy={copy.calendar} />
        <VenueSection copy={copy.venue} navCopy={copy.nav} />
        <RsvpSection copy={copy.rsvp} />
        <GallerySection language={language} copy={copy.gallery} />
        <GuestUploadSection copy={copy.upload} />
        <FooterSection copy={copy.footer} />
      </div>
    </main>
  )
}
