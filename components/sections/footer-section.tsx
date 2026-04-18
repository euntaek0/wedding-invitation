import { Reveal } from '@/components/ui/reveal'

type FooterCopy = {
  thanks: string
  signature: string
}

interface FooterSectionProps {
  copy: FooterCopy
}

export function FooterSection({ copy }: FooterSectionProps) {
  return (
    <Reveal className="border-t border-[var(--line)] px-5 pb-16 pt-12 sm:px-8 sm:pt-14">
      <footer id="footer" className="space-y-3 text-center">
        <p className="text-base leading-relaxed text-[var(--muted)]">{copy.thanks}</p>
        <p className="section-title text-xl text-[var(--foreground)]">{copy.signature}</p>
      </footer>
    </Reveal>
  )
}
