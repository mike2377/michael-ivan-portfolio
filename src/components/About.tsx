import { GraduationCap, Code2 } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';

const highlights = [
  { icon: GraduationCap, label: profile.highlights[0] },
  { icon: Code2, label: profile.highlights[1] },
];

export default function About() {
  return (
    <section id="about" tabIndex={-1} className="section-anchor relative py-24 focus:outline-none sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeading eyebrow="About" title="Clean code, useful products, thoughtful experiences." />
          <div className="flex flex-col gap-5">
            {profile.aboutParagraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 100}>
                <p className="text-base leading-relaxed text-muted sm:text-lg">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={150} className="rounded-xl border border-line bg-card/70 p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-400">Focus areas</h3>
            <ul className="mt-6 flex flex-col gap-4">
              {highlights.map(({ icon: Icon, label }) => (
                <li key={label} className="group flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-secondary-300 transition-colors duration-300 group-hover:border-secondary-400/50 group-hover:text-secondary-300">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="pt-2 text-sm leading-relaxed text-ink sm:text-base">{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={250} className="grid gap-4 sm:grid-cols-2">
            {profile.languages.map((language) => (
              <div
                key={language.name}
                className="rounded-xl border border-line bg-panel/80 p-5 transition-colors duration-300 hover:border-primary-500/50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Language</p>
                <p className="mt-2 text-lg font-semibold text-ink">{language.name}</p>
                <p className="text-sm text-secondary-300">{language.level}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
