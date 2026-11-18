import { ArrowRight } from 'lucide-react';
import { services } from '@/data/services';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';

export default function Services() {
  return (
    <section id="services" tabIndex={-1} className="section-anchor relative bg-panel/50 py-24 focus:outline-none sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Services"
          title="How I can help your project move forward."
          description="Responsive web implementation, scoped Python scripts, and spreadsheet and document workflows."
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.id} as="li" delay={(index % 3) * 90} className="flex">
                <article className="group flex w-full flex-col gap-5 rounded-xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary-400/50 hover:shadow-xl hover:shadow-secondary-400/10 sm:p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-400/10 text-secondary-300 ring-1 ring-secondary-400/20 transition-colors duration-300 group-hover:bg-secondary-400/20">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-ink">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{service.description}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Typical deliverables</h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable} className="rounded-md border border-line bg-canvas/60 px-2.5 py-1.5 text-xs text-ink">
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Technologies</h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {service.technologies.map((technology) => (
                        <li key={technology} className="rounded-md border border-line px-2.5 py-1.5 text-xs text-muted">
                          {technology}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="#contact"
                    className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary-300 transition-colors hover:text-secondary-300"
                  >
                    Discuss this service
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
