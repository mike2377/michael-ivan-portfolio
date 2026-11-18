import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { ProjectScreenshotAsset } from '@/data/types';

interface ProjectGalleryProps {
  screenshots: ProjectScreenshotAsset[];
  onLightboxChange?: (open: boolean) => void;
}

const focusableSelector = 'button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

export default function ProjectGallery({ screenshots, onLightboxChange }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImageButtonRef = useRef<HTMLButtonElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasLightboxOpen = useRef(false);

  const selectedScreenshot = screenshots[selectedIndex];

  const selectPrevious = () => {
    setSelectedIndex((index) => (index - 1 + screenshots.length) % screenshots.length);
  };

  const selectNext = () => {
    setSelectedIndex((index) => (index + 1) % screenshots.length);
  };

  const setLightbox = (open: boolean) => {
    setLightboxOpen(open);
    onLightboxChange?.(open);
  };

  useEffect(() => {
    if (lightboxOpen) {
      lightboxCloseButtonRef.current?.focus();
    } else if (wasLightboxOpen.current) {
      selectedImageButtonRef.current?.focus();
    }
    wasLightboxOpen.current = lightboxOpen;
  }, [lightboxOpen]);

  const handleLightboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setLightbox(false);
      return;
    }

    if (event.key !== 'Tab' || !lightboxRef.current) return;
    event.stopPropagation();

    const focusable = Array.from(lightboxRef.current.querySelectorAll<HTMLElement>(focusableSelector));
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

  if (screenshots.length === 0) return null;

  const imageCaption = selectedScreenshot.caption ?? selectedScreenshot.alt;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <figure className="flex min-w-0 flex-col gap-3">
        <div className="flex min-h-48 max-h-[65vh] min-w-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-canvas p-3 sm:min-h-64 sm:p-5">
          <button
            ref={selectedImageButtonRef}
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Enlarge image: ${imageCaption}`}
            aria-haspopup="dialog"
            className="group relative flex max-h-[60vh] max-w-full cursor-zoom-in items-center justify-center rounded-lg focus-visible:outline-offset-4"
          >
            <img
              src={selectedScreenshot.src}
              srcSet={`${selectedScreenshot.smallSrc} ${selectedScreenshot.smallWidth}w, ${selectedScreenshot.mediumSrc} ${selectedScreenshot.mediumWidth}w, ${selectedScreenshot.src} ${selectedScreenshot.width}w`}
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 80vw, 760px"
              width={selectedScreenshot.width}
              height={selectedScreenshot.height}
              alt={selectedScreenshot.alt}
              decoding="async"
              className="max-h-[60vh] max-w-full object-contain"
            />
            <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas/90 text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 size={17} aria-hidden="true" />
            </span>
          </button>
        </div>
        {selectedScreenshot.caption && (
          <figcaption className="text-center text-sm text-muted">{selectedScreenshot.caption}</figcaption>
        )}
      </figure>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={selectPrevious}
          aria-label="Previous image"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-500 bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-secondary-400/60 hover:text-secondary-300"
        >
          <ChevronLeft size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <span role="status" aria-atomic="true" className="text-sm tabular-nums text-muted">
          {selectedIndex + 1} / {screenshots.length}
        </span>
        <button
          type="button"
          onClick={selectNext}
          aria-label="Next image"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-500 bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-secondary-400/60 hover:text-secondary-300"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>

      {screenshots.length > 1 && (
        <div role="group" aria-label="Choose an image" className="flex min-w-0 gap-2 overflow-x-auto pb-2">
          {screenshots.map((screenshot, index) => {
            const label = screenshot.caption ?? screenshot.alt;
            const selected = index === selectedIndex;

            return (
              <button
                key={screenshot.src}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show image ${index + 1}: ${label}`}
                aria-pressed={selected}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border bg-canvas p-1 transition-colors focus-visible:outline-offset-2 ${
                  selected ? 'border-secondary-400 ring-1 ring-secondary-400/60' : 'border-slate-500 hover:border-secondary-400/60'
                }`}
              >
                <img src={screenshot.thumbnailSrc} width={screenshot.thumbnailWidth} height={Math.round(screenshot.height * screenshot.thumbnailWidth / screenshot.width)} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </button>
            );
          })}
        </div>
      )}

      {lightboxOpen && createPortal(
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged project image: ${imageCaption}`}
          onKeyDown={handleLightboxKeyDown}
          className="fixed inset-0 z-[80] flex h-screen flex-col bg-canvas/95 p-4 backdrop-blur-md sm:p-6"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close enlarged image"
            onClick={() => setLightbox(false)}
            className="absolute inset-0 cursor-zoom-out"
          />

          <div className="relative z-10 flex min-h-12 items-center justify-between gap-4">
            <p className="min-w-0 truncate text-sm font-medium text-ink sm:text-base">{imageCaption}</p>
            <button
              ref={lightboxCloseButtonRef}
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close enlarged image"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-500 bg-card text-ink transition-colors hover:border-secondary-400/60 hover:text-secondary-300"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={selectPrevious}
              aria-label="Previous image"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-500 bg-card text-ink transition-colors hover:border-secondary-400/60 hover:text-secondary-300"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <img
              src={selectedScreenshot.src}
              width={selectedScreenshot.width}
              height={selectedScreenshot.height}
              alt={selectedScreenshot.alt}
              className="max-h-[calc(100vh-9rem)] max-w-[calc(100vw-10rem)] object-contain sm:max-w-[calc(100vw-12rem)]"
            />
            <button
              type="button"
              onClick={selectNext}
              aria-label="Next image"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-500 bg-card text-ink transition-colors hover:border-secondary-400/60 hover:text-secondary-300"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <p role="status" aria-atomic="true" className="relative z-10 pb-2 text-center text-sm text-muted">
            {selectedIndex + 1} / {screenshots.length}
          </p>
        </div>,
        document.body,
      )}
    </div>
  );
}
