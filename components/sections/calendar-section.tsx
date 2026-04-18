"use client";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { buildJune2026Matrix } from "@/lib/date";
import { weddingContent } from "@/content/invitation";
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

function two(n: number) {
  return String(n).padStart(2, "0");
}

function ordinal(day: number) {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

export function CalendarSection({ language }: CalendarSectionProps) {
  const cells = useMemo(() => buildJune2026Matrix(), []);
  const [now, setNow] = useState(() => new Date());
  const weddingDate = useMemo(() => new Date(weddingContent.date.iso), []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalMs = weddingDate.getTime() - now.getTime();
  const safeMs = Math.max(totalMs, 0);
  const totalSeconds = Math.floor(safeMs / 1000);

  const dDays = Math.ceil(safeMs / (1000 * 60 * 60 * 24));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const topDateLabel = `${weddingDate.getFullYear()} June ${ordinal(weddingDate.getDate())}`;
  const topTimeLabel = language === "ko" ? "토요일 낮 12시" : "Saturday 12:00 PM";

  const ddayCountKo = `${dDays}일`;
  const ddayTailKo = dDays > 0 ? `${ddayCountKo} 남았습니다.` : "오늘은 결혼식 당일입니다.";
  const ddayTailEn = dDays > 0 ? `${dDays} days left until the wedding.` : "Today is the wedding day.";

  return (
    <Reveal className="wi-section wi-section-calendar border-t border-[var(--line)] px-5 py-8 sm:px-8 sm:py-10">
      <section id="calendar" className="wi-calendar">
        <div className="wi-calendar-card px-6 py-10">
          <div className="space-y-2 text-center">
            <p className="section-title text-[1.5rem] leading-none text-[#59524f]">{topDateLabel}</p>
            <p className="text-[1rem] leading-none text-[#b6aba4]">.</p>
            <p className="text-[1rem] text-[#5f5753]">{topTimeLabel}</p>
          </div>

          <div className="my-9 h-px bg-[#ddd3c8]" />

          <div className="wi-calendar-grid grid grid-cols-7 gap-y-5 text-center text-[1rem] text-[#504845]">
            {dayLabels[language].map((day) => (
              <span
                key={day}
                className={`py-1 text-[1rem] ${day === "일" || day === "Sun" ? "text-[#d45c3f]" : "text-[#504845]"}`}
              >
                {day}
              </span>
            ))}

            {cells.map((day, idx) => {
              const isWeddingDay = day === 6;
              const isSunday = idx % 7 === 0;

              return (
                <div key={`${day}-${idx}`} className="flex h-8 items-center justify-center py-1 text-[1rem]">
                  {day == null ? (
                    ""
                  ) : isWeddingDay ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c8a28b] text-[1rem] text-white">
                      {day}
                    </span>
                  ) : (
                    <span className={isSunday ? "text-[#d45c3f]" : "text-[#504845]"}>{day}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="my-9 h-px bg-[#ddd3c8]" />

          <div className="mx-auto max-w-[320px] space-y-3 text-center">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-end text-[0.78rem] tracking-[0.04em] text-[#ab9b90]">
              <span>DAYS</span>
              <span />
              <span>HOUR</span>
              <span />
              <span>MIN</span>
              <span />
              <span>SEC</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center px-3 text-[1rem] text-[#645955]">
              <span>{two(days)}</span>
              <span className="px-3 text-[#8f8075]">:</span>
              <span>{two(hours)}</span>
              <span className="px-3 text-[#8f8075]">:</span>
              <span>{two(minutes)}</span>
              <span className="px-3 text-[#8f8075]">:</span>
              <span>{two(seconds)}</span>
            </div>
          </div>

          <p className="wi-calendar-countdown mt-10 text-center text-[1rem] leading-relaxed text-[#5b524f]">
            {language === "ko" && dDays > 0 ? (
              <span className="inline-flex items-center justify-center gap-1">
                <span>은성</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-[14px] w-[14px] text-[var(--accent-strong)]"
                  fill="currentColor"
                >
                  <path d="M12 20.6c-.2 0-.4-.07-.56-.2l-6.3-5.42A5.18 5.18 0 0 1 3.4 11.1C3.4 8.29 5.68 6 8.5 6c1.34 0 2.62.53 3.5 1.47A4.92 4.92 0 0 1 15.5 6c2.82 0 5.1 2.28 5.1 5.1 0 1.52-.67 2.96-1.84 3.93l-6.2 5.35a.88.88 0 0 1-.56.22Z" />
                </svg>
                <span>
                  예은의 결혼식이 <span className="text-[var(--accent-strong)]">{ddayCountKo}</span> 남았습니다.
                </span>
              </span>
            ) : (
              <span>{language === "ko" ? ddayTailKo : ddayTailEn}</span>
            )}
          </p>
        </div>
      </section>
    </Reveal>
  );
}
