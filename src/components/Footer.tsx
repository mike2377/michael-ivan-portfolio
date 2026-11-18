import { Github, Linkedin, MessageCircle } from 'lucide-react';
import { profile } from '@/data/profile';

const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-panel/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
        <div className="flex flex-col gap-4">
          <p className="font-bold tracking-[0.18em] text-ink">{profile.wordmark}</p>
          <p className="text-sm text-muted">{profile.shortTitle}, Web Development & Automation</p>
          <p className="text-sm text-muted">{profile.location}</p>
        </div>

        <nav aria-label="Footer navigation">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Navigate</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-muted transition-colors hover:text-secondary-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Connect</p>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-secondary-300"
              >
                <Linkedin size={16} aria-hidden="true" />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-secondary-300"
              >
                <Github size={16} aria-hidden="true" />
                GitHub
              </a>
            </li>
            <li>
              <a
                href={profile.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-secondary-300"
              >
                <MessageCircle size={16} aria-hidden="true" />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted sm:px-8">
          &copy; {year} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
