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
    <Reveal className="border-t border-[var(--line)] px-4 pb-10 pt-8 sm:px-6">
      <footer id="footer" className="space-y-2 text-center">
        <p className="text-sm text-[var(--muted)]">{copy.thanks}</p>
        <p className="section-title text-xl text-[var(--foreground)]">{copy.signature}</p>
      </footer>
    </Reveal>
  )
}
