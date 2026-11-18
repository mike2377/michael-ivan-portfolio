import type { LucideIcon } from 'lucide-react';

export type ProjectCategory =
  | 'Personal Project'
  | 'Academic Project'
  | 'Professional Project'
  | 'Professional Experience'
  | 'Independent Project';

export type ProjectLinkType = 'live' | 'source' | 'contribution' | 'documentation';

export interface ProjectLink {
  label: string;
  url: string;
  type: ProjectLinkType;
}

export interface ProjectScreenshotAsset {
  src: string;
  smallSrc: string;
  mediumSrc: string;
  thumbnailSrc: string;
  width: number;
  height: number;
  smallWidth: number;
  mediumWidth: number;
  thumbnailWidth: number;
  alt: string;
  caption?: string;
  fit?: 'cover' | 'contain';
}

export interface Project {
  id: string;
  number: string;
  title: string;
  description: string;
  features: string[];
  technologies: string[];
  categories: ProjectCategory[];
  screenshots: ProjectScreenshotAsset[];
  links: ProjectLink[];
  confidentialityNotice?: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  items: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  icon: LucideIcon;
}
