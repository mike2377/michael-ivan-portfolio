import { Database, Layers3, Server, Table2, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { skillGroups } from '@/data/skills';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';

const groupIcons: Record<string, LucideIcon> = {
  frontend: Layers3,
  backend: Server,
  automation: Terminal,
  databases: Database,
  tools: Table2,
};

export default function Skills() {
  return (
    <section id="skills" tabIndex={-1} className="section-anchor relative bg-panel/50 py-24 focus:outline-none sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Skills & Technologies"
          title="The tools I use to build and automate."
          description="Technologies and tools I've used across projects, internships, and practical work; experience varies by area."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {skillGroups.map((group, index) => {
            const Icon = groupIcons[group.id];
            const spanClass = index < 3 ? 'lg:col-span-2' : 'lg:col-span-3';
            return (
              <Reveal key={group.id} delay={index * 80} className={`${spanClass} group`}>
                <article className="flex h-full flex-col gap-6 rounded-xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/10 sm:p-7">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300 ring-1 ring-primary-500/20 transition-colors duration-300 group-hover:bg-primary-500/20">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                      <p className="text-sm text-muted">{group.description}</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-canvas/60 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-secondary-400/60 hover:text-secondary-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
