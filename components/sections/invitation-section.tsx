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
    <Reveal className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-14">
      <section id="invitation" className="space-y-7 text-center">
        <h2 className="section-title text-[1.85rem] text-[var(--foreground)]">{copy.heading}</h2>
        <div className="space-y-5 text-base leading-8 text-[var(--muted)]">
          {copy.body.map((line, idx) => (
            <p key={`${line}-${idx}`}>{line}</p>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
