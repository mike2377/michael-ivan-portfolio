import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { profile } from '@/data/profile';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((targetHref?: string) => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => {
      if (targetHref) {
        document.querySelector<HTMLElement>(targetHref)?.focus({ preventScroll: true });
      } else {
        menuButtonRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-line bg-canvas/85 shadow-lg shadow-black/20 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:h-20">
        <a href="#home" onClick={() => closeMenu('#home')} className="group flex items-center gap-3" aria-label="Michael Ivan, back to top">
          <span className="font-bold tracking-[0.18em] text-ink transition-colors group-hover:text-secondary-300">
            {profile.wordmark}
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-primary-500/35 sm:inline-flex"
          >
            Let&apos;s Talk
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-500 text-ink transition-colors hover:border-primary-500/60 hover:text-secondary-300 lg:hidden"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-b border-line bg-panel transition-[max-height,opacity] duration-300 lg:hidden ${
          menuOpen ? 'max-h-[32rem] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <ul className="flex flex-col gap-1 px-5 py-4 sm:px-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => closeMenu(link.href)}
                tabIndex={menuOpen ? 0 : -1}
                className="flex min-h-11 items-center rounded-lg px-4 text-base font-medium text-muted transition-colors hover:bg-card hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#contact"
              onClick={() => closeMenu('#contact')}
              tabIndex={menuOpen ? 0 : -1}
              className="flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Let&apos;s Talk
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
