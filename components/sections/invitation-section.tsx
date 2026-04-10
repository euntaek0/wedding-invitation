import { Reveal } from '@/components/ui/reveal'

type InvitationSectionCopy = {
  heading: string
  body: readonly string[]
}

interface InvitationSectionProps {
  copy: InvitationSectionCopy
}

export function InvitationSection({ copy }: InvitationSectionProps) {
  return (
    <Reveal className="border-t border-[var(--line)] px-4 py-8 sm:px-6">
      <section id="invitation" className="space-y-5 text-center">
        <h2 className="section-title text-[1.7rem] text-[var(--foreground)]">{copy.heading}</h2>
        <div className="space-y-3 text-[15px] leading-relaxed text-[var(--muted)]">
          {copy.body.map((line, idx) => (
            <p key={`${line}-${idx}`}>{line}</p>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
