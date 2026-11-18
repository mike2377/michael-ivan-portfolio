import { Monitor, Table2, Workflow } from 'lucide-react';
import type { Service } from '@/data/types';

export const services: Service[] = [
  {
    id: 'responsive-web-implementation',
    title: 'Responsive Websites & Landing Pages',
    description:
      'Need a website or focused landing page? I build agreed page content or a supplied Figma design into responsive web pages.',
    deliverables: ['Responsive page(s)', 'Navigation & interactions', 'Source files'],
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'React', 'Figma'],
    icon: Monitor,
  },
  {
    id: 'automation-data-workflows',
    title: 'Automation & Data Workflows',
    description:
      'Need to reduce repetitive processing? I can build a scoped Python script for rule-based tasks, or a Microsoft Power Automate flow for email-based application intake, spreadsheet tracking, and file organization.',
    deliverables: ['Python script or Power Automate flow', 'Agreed data and file handling', 'Setup and handover notes'],
    technologies: ['Python', 'Microsoft Power Automate', 'Microsoft Excel'],
    icon: Workflow,
  },
  {
    id: 'excel-word-workflows',
    title: 'Excel Data Processing & Word Mail Merge',
    description:
      'Need to organize or verify spreadsheet data and create repeatable documents? I can prepare a workbook with agreed VLOOKUP checks and a Word Mail Merge template.',
    deliverables: ['Organized workbook', 'Lookup checks', 'Word Mail Merge template'],
    technologies: ['Microsoft Excel', 'VLOOKUP', 'Microsoft Word', 'Mail Merge'],
    icon: Table2,
  },
];
