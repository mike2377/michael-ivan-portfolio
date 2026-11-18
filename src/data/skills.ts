import type { SkillGroup } from '@/data/types';

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Languages and frameworks used to build web interfaces.',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Bootstrap', 'jQuery'],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Server-side languages, frameworks, and email integration tools.',
    items: ['PHP', 'PHPMailer', 'Node.js', 'Express'],
  },
  {
    id: 'automation',
    title: 'Programming & Automation',
    description: 'Scripting languages for programming and task automation.',
    items: ['Python', 'Bash'],
  },
  {
    id: 'databases',
    title: 'Database & Developer Tools',
    description: 'Databases, version control, design, and development tools.',
    items: ['MySQL', 'Firebase', 'Firestore', 'Git', 'GitHub', 'Figma', 'Vite'],
  },
  {
    id: 'tools',
    title: 'Productivity & Data Processing',
    description: 'Spreadsheet lookup and verification, document generation, and assisted analysis tools.',
    items: ['Microsoft Excel', 'VLOOKUP', 'Microsoft Word', 'Mail Merge', 'Microsoft Copilot', 'Microsoft Power Automate'],
  },
];
