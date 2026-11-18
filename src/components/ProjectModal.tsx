import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Check, ExternalLink, Github, ShieldCheck, X } from 'lucide-react';
import type { Project } from '@/data/types';
import ProjectGallery from '@/components/ProjectGallery';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

interface ProjectModalContentProps extends ProjectModalProps {
  galleryLightboxOpen: boolean;
  onGalleryLightboxChange: (open: boolean) => void;
}

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ExternalButton({ href, label, type }: { href: string; label: string; type: 'live' | 'source' | 'contribution' | 'documentation' }) {
  const Icon = type === 'documentation' ? BookOpen : type === 'source' || type === 'contribution' ? Github : ExternalLink;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-500 bg-card px-4 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-400/60 hover:text-secondary-300"
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </a>
  );
}

export default function ProjectModal(props: ProjectModalProps) {
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
  return createPortal(
    <ProjectModalContent
      {...props}
      galleryLightboxOpen={galleryLightboxOpen}
      onGalleryLightboxChange={setGalleryLightboxOpen}
    />,
    document.body,
  );
}

function ProjectModalContent({ project, onClose, galleryLightboxOpen, onGalleryLightboxChange }: ProjectModalContentProps) {
  const titleId = useId();
  const overviewId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const galleryLightboxOpenRef = useRef(galleryLightboxOpen);
  galleryLightboxOpenRef.current = galleryLightboxOpen;

  useLayoutEffect(() => {
    if (!dialogRef.current) return;
    if (galleryLightboxOpen) {
      dialogRef.current.setAttribute('inert', '');
      dialogRef.current.setAttribute('aria-hidden', 'true');
    } else {
      dialogRef.current.removeAttribute('inert');
      dialogRef.current.removeAttribute('aria-hidden');
    }
  }, [galleryLightboxOpen]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const appContent = document.getElementById('app-content');
    const previousInert = appContent?.getAttribute('inert') ?? null;
    const previousAriaHidden = appContent?.getAttribute('aria-hidden') ?? null;
    document.body.style.overflow = 'hidden';
    appContent?.setAttribute('inert', '');
    appContent?.setAttribute('aria-hidden', 'true');
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (galleryLightboxOpenRef.current) return;
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeIndex === -1 || activeIndex === focusable.length - 1)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (appContent) {
        if (previousInert === null) appContent.removeAttribute('inert');
        else appContent.setAttribute('inert', previousInert);
        if (previousAriaHidden === null) appContent.removeAttribute('aria-hidden');
        else appContent.setAttribute('aria-hidden', previousAriaHidden);
      }
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close project details"
        onClick={onClose}
        className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={overviewId}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-panel shadow-2xl shadow-black/50 animate-fade-up sm:max-w-3xl sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold text-secondary-300">PROJECT {project.number}</p>
            <h2 id={titleId} className="text-2xl font-bold text-ink sm:text-3xl">
              {project.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-500 text-muted transition-colors hover:border-secondary-400/60 hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {project.categories.map((category) => (
                  <span key={category} className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300">
                    {category}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Overview</h3>
              <p id={overviewId} className="text-base leading-relaxed text-ink/90">{project.description}</p>
            </section>

            {project.features.length > 0 && <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Key features</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-400/15 text-secondary-300">
                      <Check size={14} aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>}

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Technology stack</h3>
              <ul className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <li key={tech} className="rounded-md border border-line bg-card px-3 py-1.5 text-sm text-ink">
                    {tech}
                  </li>
                ))}
              </ul>
            </section>

            {project.screenshots.length > 0 && (
              <section className="flex min-w-0 flex-col gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Project gallery</h3>
                <ProjectGallery screenshots={project.screenshots} onLightboxChange={onGalleryLightboxChange} />
              </section>
            )}

            {project.confidentialityNotice && (
              <section className="flex items-start gap-3 rounded-xl border border-secondary-400/25 bg-secondary-400/5 p-5 text-sm leading-relaxed text-muted">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-secondary-300" aria-hidden="true" />
                <p>{project.confidentialityNotice}</p>
              </section>
            )}

            {project.links.length > 0 && <section className="flex flex-col gap-4 border-t border-line pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Links</h3>
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <ExternalButton key={link.type} href={link.url} label={link.label} type={link.type} />
                ))}
              </div>
            </section>}
          </div>
        </div>
      </div>
    </div>
  );
}
