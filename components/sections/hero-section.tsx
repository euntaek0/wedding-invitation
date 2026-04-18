import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { weddingContent } from "@/content/invitation";
import type { Language } from "@/types/language";

type HeroCopy = {
  title: string;
  subtitle: string;
  dateLine: string;
  venueLine: string;
};

interface HeroSectionProps {
  language: Language;
  copy: HeroCopy;
}

export function HeroSection({ language, copy }: HeroSectionProps) {
  const eventDate = new Date(weddingContent.date.iso);
  const yy = String(eventDate.getFullYear()).slice(2);
  const mm = String(eventDate.getMonth() + 1).padStart(2, "0");
  const dd = String(eventDate.getDate()).padStart(2, "0");
  const weekday = language === "ko" ? "SATURDAY" : "SATURDAY";
  const [leftName, rightName] = weddingContent.names[language].split("|").map((part) => part.trim());

  return (
    <Reveal className="wi-section wi-section-hero px-5 pb-18 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
      <section id="hero" className="wi-hero space-y-10">
        <div className="wi-hero-date-block space-y-1 text-center pt-3">
          <p className="wi-hero-date-digits section-title text-[2.2rem] leading-none text-[#544a4b]">
            <span className="inline-flex items-center justify-center gap-3">
              <span>{yy}</span>
              <span className="wi-hero-date-separator text-[1.25rem] text-[#b8abac]">|</span>
              <span>{mm}</span>
              <span className="wi-hero-date-separator text-[1.25rem] text-[#b8abac]">|</span>
              <span>{dd}</span>
            </span>
          </p>
          <p className="wi-hero-date-weekday text-sm tracking-[0.24em] text-[#7f7476]">{weekday}</p>
        </div>

        <div className="wi-hero-main-photo my-7 aspect-[1/1.06] overflow-hidden border border-[var(--line)] bg-[var(--surface-soft)]">
          <Image
            src="/imgs/YJ_00859.jpg"
            alt="신랑 신부 웨딩 사진"
            width={3000}
            height={4000}
            priority
            className="h-full w-full object-cover object-[50%_24%]"
            sizes="(max-width: 768px) 100vw, 460px"
          />
        </div>

        <div className="wi-hero-copy space-y-4 text-center">
          <h1 className="wi-hero-names section-title py-4 text-[1.25rem] leading-[1.24] text-[var(--foreground)]">
            <span className="inline-flex items-center justify-center gap-4">
              <span className="wi-hero-name-left">{leftName || weddingContent.names[language]}</span>
              {rightName ? <span className="wi-hero-name-divider text-[var(--muted)]">|</span> : null}
              {rightName ? <span className="wi-hero-name-right">{rightName}</span> : null}
            </span>
          </h1>
          <div className="wi-hero-meta space-y-3">
            <p className="wi-hero-date text-base font-medium text-[var(--foreground)]">{copy.dateLine}</p>
            <p className="wi-hero-venue text-sm text-[var(--muted)]">{copy.venueLine}</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
