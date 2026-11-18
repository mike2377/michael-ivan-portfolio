import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import type { Project } from '@/data/types';
import ProjectScreenshot from '@/components/ProjectScreenshot';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const cover = project.screenshots[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      aria-haspopup="dialog"
      aria-label={`Open case study: ${project.title}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-500 bg-card text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-panel">
        <ProjectScreenshot
          src={cover?.mediumSrc ?? cover?.src}
          srcSet={cover ? `${cover.thumbnailSrc} ${cover.thumbnailWidth}w, ${cover.smallSrc} ${cover.smallWidth}w, ${cover.mediumSrc} ${cover.mediumWidth}w` : undefined}
          sizes="(min-width: 1152px) 33.25rem, (min-width: 768px) calc((100vw - 5.5rem) / 2), (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
          width={cover?.width}
          height={cover?.height}
          alt={cover?.alt}
          fit={cover?.fit}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-md bg-canvas/80 px-2.5 py-1 font-mono text-xs font-semibold text-secondary-300 backdrop-blur">
          {project.number}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-2">
          {project.categories.map((category) => (
            <span key={category} className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-medium text-primary-300">
              {category}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-ink transition-colors group-hover:text-secondary-300">{project.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.description}</p>

        {project.confidentialityNotice && (
          <p className="flex items-start gap-2 rounded-lg border border-secondary-400/20 bg-secondary-400/5 px-3 py-2 text-xs leading-relaxed text-muted">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-secondary-300" aria-hidden="true" />
            <span>Confidential professional work</span>
          </p>
        )}

        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech} className="rounded-md border border-line px-2 py-1 text-xs text-muted">
              {tech}
            </li>
          ))}
          {project.technologies.length > 4 && (
            <li className="px-2 py-1 text-xs text-muted">+{project.technologies.length - 4}</li>
          )}
        </ul>

        <span className="flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-primary-300 transition-colors group-hover:text-secondary-300">
          View case study
          <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
