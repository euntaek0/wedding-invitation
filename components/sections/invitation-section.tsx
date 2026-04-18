import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

type InvitationSectionCopy = {
  heading: string;
  body: readonly string[];
};

interface InvitationSectionProps {
  copy: InvitationSectionCopy;
}

export function InvitationSection({ copy }: InvitationSectionProps) {
  const renderLine = (line: string, idx: number) => {
    const segments = line.split(/(사랑|축복)/g);

    return (
      <p key={`${line}-${idx}`} className="wi-invitation-line">
        {segments.map((segment, segmentIdx) =>
          segment === "사랑" || segment === "축복" ? (
            <span key={`${segment}-${segmentIdx}`} className="text-[var(--accent-strong)]">
              {segment}
            </span>
          ) : (
            <span key={`${segment}-${segmentIdx}`}>{segment}</span>
          ),
        )}
      </p>
    );
  };

  return (
    <Reveal className="wi-section wi-section-invitation px-7 py-14 sm:px-11 sm:py-16">
      <section id="invitation" className="wi-invitation mx-auto mb-40 max-w-[340px] space-y-9 text-center">
        <div className="wi-invitation-header space-y-3">
          <p className="wi-invitation-badge text-[0.9rem] tracking-[0.3em] text-[#9c8f91]">INVITATION</p>
          <h2 className="wi-title wi-invitation-title section-title text-[1.55rem] text-[#87797b]">{copy.heading}</h2>
        </div>

        <div className="wi-invitation-body space-y-6 text-[0.96rem] leading-[1.95] text-[#554b4c]">
          {copy.body.map((line, idx) => renderLine(line, idx))}
        </div>
      </section>

      <div className="wi-invitation-hand-photo mt-14 -mx-7 sm:-mx-11 mb-6">
        <Image
          src="/imgs/hand.webp"
          alt="신랑 신부 손과 부케 사진"
          width={2910}
          height={1805}
          className="h-auto w-full"
          sizes="100vw"
        />
      </div>
    </Reveal>
  );
}
