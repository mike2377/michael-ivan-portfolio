import { useCallback, useMemo, useState } from 'react';
import { projects } from '@/data/projects';
import type { Project, ProjectCategory } from '@/data/types';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';

type ProjectFilter = 'All' | ProjectCategory;

const filters: ProjectFilter[] = [
  'All',
  'Personal Project',
  'Academic Project',
  'Professional Project',
  'Professional Experience',
  'Independent Project',
];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const visibleProjects = useMemo(
    () => projects.filter((project) => activeFilter === 'All' || project.categories.includes(activeFilter)),
    [activeFilter],
  );

  const closeProject = useCallback(() => setSelectedProject(null), []);

  return (
    <section id="projects" tabIndex={-1} className="section-anchor relative py-24 focus:outline-none sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Featured Projects"
            title="Work that turns ideas into working software."
            description="A selection of web interfaces and automation workflows. Select a project to read the full case study."
          />

          <Reveal delay={120}>
            <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const active = filter === activeFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-11 rounded-full border px-5 text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'border-secondary-400/60 bg-secondary-400/10 text-secondary-300'
                        : 'border-slate-500 bg-card/60 text-muted hover:border-primary-500/50 hover:text-ink'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <p role="status" aria-atomic="true" className="sr-only">
          {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'} shown for {activeFilter}.
        </p>

        <div key={activeFilter} className="mt-14 grid gap-6 md:grid-cols-2 animate-fade-up">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
          ))}
        </div>

        {visibleProjects.length === 0 && (
          <p className="mt-14 text-center text-muted">No projects in this category yet.</p>
        )}
      </div>

      {selectedProject && <ProjectModal project={selectedProject} onClose={closeProject} />}
    </section>
  );
}
