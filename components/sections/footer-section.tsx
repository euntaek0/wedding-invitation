import { Reveal } from "@/components/ui/reveal";

type FooterCopy = {
  thanks: string;
  signature: string;
};

interface FooterSectionProps {
  copy: FooterCopy;
}

export function FooterSection({ copy }: FooterSectionProps) {
  return (
    <Reveal className="wi-section wi-section-footer px-5 py-16 sm:px-8 sm:py-20">
      <footer
        id="footer"
        className="wi-footer flex min-h-[30svh] flex-col items-center justify-center space-y-4 text-center"
      >
        <p className="wi-footer-thanks whitespace-pre-line text-base leading-[1.9] text-[var(--muted)]">
          {copy.thanks}
        </p>
        <p className="wi-footer-signature section-title text-xl text-[var(--foreground)]">{copy.signature}</p>
      </footer>
    </Reveal>
  );
}
