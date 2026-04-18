"use client";

import { useMemo } from "react";
import { Reveal } from "@/components/ui/reveal";
import { buildJune2026Matrix, getCountdownMessage } from "@/lib/date";
import type { Language } from "@/types/language";

type CalendarCopy = {
  heading: string;
  caption: string;
  ddayPrefix: string;
  ddaySuffix: string;
  ddayDone: string;
  ddayPassed: string;
};

interface CalendarSectionProps {
  language: Language;
  copy: CalendarCopy;
}

const dayLabels: Record<Language, string[]> = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export function CalendarSection({ language, copy }: CalendarSectionProps) {
  const cells = useMemo(() => buildJune2026Matrix(), []);
  const countdown = useMemo(() => getCountdownMessage(language), [language]);
  const isDday = countdown.startsWith("D-");
  const countdownDays = isDday ? countdown.slice(2) : "";
  const startsWithDprefix = copy.ddayPrefix.trim().endsWith("D-");

  const countdownText = isDday
    ? startsWithDprefix
      ? `${copy.ddayPrefix}${countdownDays}${copy.ddaySuffix}`
      : `${copy.ddayPrefix}${countdown}${copy.ddaySuffix}`
    : countdown;

  return (
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="calendar" className="space-y-6">
        <h2 className="section-title wedding-script-title text-center text-[1.8rem] text-[var(--foreground)]">
          {copy.heading}
        </h2>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
          <p className="mb-5 text-center text-base text-[var(--muted)]">{copy.caption}</p>

          <div className="grid grid-cols-7 gap-1.5 text-center text-sm text-[var(--muted)]">
            {dayLabels[language].map((day) => (
              <span key={day} className="py-1.5">
                {day}
              </span>
            ))}

            {cells.map((day, idx) => {
              const isWeddingDay = day === 6;

              return (
                <div
                  key={`${day}-${idx}`}
                  className={`rounded-lg py-2 text-sm ${
                    isWeddingDay
                      ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {day ?? ""}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-center text-base font-medium text-[var(--accent-strong)]">{countdownText}</p>
        </div>
      </section>
    </Reveal>
  );
}
