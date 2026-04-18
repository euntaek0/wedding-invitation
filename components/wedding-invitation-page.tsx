"use client";

import { useEffect, useMemo, useState } from "react";
import { invitationCopy } from "@/content/invitation";
import { CalendarSection } from "@/components/sections/calendar-section";
import { FooterSection } from "@/components/sections/footer-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { GuestUploadSection } from "@/components/sections/guest-upload-section";
import { HeroSection } from "@/components/sections/hero-section";
import { InvitationSection } from "@/components/sections/invitation-section";
import { RsvpSection } from "@/components/sections/rsvp-section";
import { VenueSection } from "@/components/sections/venue-section";
import { WeddingInfoSection } from "@/components/sections/wedding-info-section";
import type { Language } from "@/types/language";

const languageStorageKey = "wedding-invitation-language";

export function WeddingInvitationPage() {
  const [language, setLanguage] = useState<Language>("ko");

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "ko" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  const copy = useMemo(() => invitationCopy[language], [language]);

  const toggleLanguage = () => {
    const nextLanguage: Language = language === "ko" ? "en" : "ko";
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  return (
    <main className="wi-page min-h-screen py-0">
        {/* <div className="wi-language-bar flex justify-end px-5 pt-6 sm:px-8 sm:pt-7">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`Toggle language (${language})`}
            className="wi-language-toggle text-xs font-medium text-[#9f9496] transition hover:text-[#837779]"
          >
            {copy.nav.language}
          </button>
        </div> */}

        <HeroSection language={language} copy={copy.hero} />
        <InvitationSection copy={copy.invitation} />
        <WeddingInfoSection language={language} copy={copy.information} />
        <CalendarSection language={language} copy={copy.calendar} />
        <VenueSection copy={copy.venue} navCopy={copy.nav} />
        <RsvpSection copy={copy.rsvp} />
        <GallerySection language={language} copy={copy.gallery} />
        <GuestUploadSection copy={copy.upload} />
        <FooterSection copy={copy.footer} />
    </main>
  );
}
