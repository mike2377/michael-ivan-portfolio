import { Github, Linkedin, Mail, MapPin, MessageCircle } from 'lucide-react';
import { profile } from '@/data/profile';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/Reveal';

const socialLinks = [
  { label: 'LinkedIn', href: profile.links.linkedin, icon: Linkedin },
  { label: 'GitHub', href: profile.links.github, icon: Github },
  { label: 'WhatsApp', href: profile.links.whatsapp, icon: MessageCircle },
];

export default function Contact() {
  return (
    <section id="contact" tabIndex={-1} className="section-anchor relative py-24 focus:outline-none sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="flex flex-col gap-10">
          <Reveal className="flex flex-col gap-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-400">Contact</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Have a project in mind? Let&apos;s build something useful.
            </h2>
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              Share a few details about what you need. I reply to every serious inquiry, whether it is a website,
              a landing page, or a workflow you want automated.
            </p>
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-ink">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-card text-secondary-300">
                <MapPin size={18} aria-hidden="true" />
              </span>
              <span className="text-sm sm:text-base">{profile.location}</span>
            </div>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="group flex items-center gap-4 text-ink transition-colors hover:text-secondary-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-card text-secondary-300 transition-colors group-hover:border-secondary-400/60">
                <Mail size={18} aria-hidden="true" />
              </span>
              <span className="text-sm sm:text-base">{profile.contactEmail}</span>
            </a>
          </Reveal>

          <Reveal delay={200} className="flex flex-wrap gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-500 bg-card px-4 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-400/60 hover:text-secondary-300"
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </a>
            ))}
          </Reveal>
        </div>

        <Reveal delay={150}>
          <ContactForm emailFallback={profile.contactEmail} />
        </Reveal>
      </div>
    </section>
  );
}
