import type { Project, ProjectScreenshotAsset } from '@/data/types';
import { projectImageDimensions } from '@/data/projectImageDimensions';

function screenshot(path: string, alt: string, options: Pick<ProjectScreenshotAsset, 'caption' | 'fit'> = {}): ProjectScreenshotAsset {
  const dimensions = projectImageDimensions[path as keyof typeof projectImageDimensions];
  const image = (suffix: string) => `${import.meta.env.BASE_URL}images/projects/${path.replace(/\.webp$/, suffix || '.webp')}`;
  if (!dimensions) {
    throw new Error(`Missing responsive project image asset: ${path}`);
  }

  return {
    src: image(''),
    smallSrc: image('-480.webp'),
    mediumSrc: image('-960.webp'),
    thumbnailSrc: image('-320.webp'),
    ...dimensions,
    alt,
    ...options,
  };
}
export const projects: Project[] = [
  {
    id: 'expense-budget-tracker',
    number: '01',
    title: 'Expense Budget Tracker',
    description:
      'A personal finance application for tracking income, expenses and budgets through interactive charts and a responsive dashboard.',
    features: [
      'Expense tracking',
      'Budget management',
      'Financial data visualization',
      'Interactive charts',
      'Dark mode',
    ],
    technologies: ['React', 'Vite', 'Bootstrap', 'JavaScript', 'LocalStorage', 'Recharts'],
    categories: ['Personal Project'],
    screenshots: [
      { ...screenshot('expense-budget-tracker/d-dashboard.webp', 'Expense tracker dashboard with income, expenses, budget summaries and charts.') },
      { ...screenshot('expense-budget-tracker/d-budget.webp', 'Desktop view of monthly budgets with category progress.') },
      { ...screenshot('expense-budget-tracker/d-transaction.webp', 'Desktop transaction list with categories and amounts.') },
      { ...screenshot('expense-budget-tracker/d-setting.webp', 'Desktop settings for dark mode and expense categories.') },
      { ...screenshot('expense-budget-tracker/m-dashboard.webp', 'Mobile expense tracker dashboard with financial summaries and a category chart.', { fit: 'contain' }) },
      { ...screenshot('expense-budget-tracker/m-setting.webp', 'Mobile settings screen for appearance and expense categories.', { fit: 'contain' }) },
    ],
    links: [
      { label: 'Live Demo', url: 'https://expense-and-budget-tracker-app.vercel.app/', type: 'live' },
      { label: 'Source Code', url: 'https://github.com/mike2377/expense-and-budget-tracker-app', type: 'source' },
    ],
  },
  {
    id: 'whitepace-landing-page',
    number: '02',
    title: 'Whitepace Landing Page',
    description:
      'An academic interface implementation exercise: a responsive landing page based on a Figma design, focusing on layout accuracy, visual hierarchy and responsive styling.',
    features: [
      'Responsive layout',
      'Figma design implementation',
      'Layout accuracy and visual hierarchy',
      'Responsive styling',
    ],
    technologies: ['HTML', 'CSS', 'Figma'],
    categories: ['Academic Project'],
    screenshots: [
      { ...screenshot('whitepace/Macbook-Air-127.0.0.1.webp', 'Whitepace landing page displayed in a desktop browser on a laptop.') },
      { ...screenshot('whitepace/saas-ok.webp', 'Full-page screenshot of the Whitepace landing page.') },
      { ...screenshot('whitepace/Samsung-Galaxy-S20-127.0.0.1.webp', 'Whitepace landing page displayed in a mobile browser.', { fit: 'contain' }) },
    ],
    links: [
      { label: 'Live Preview', url: 'https://figma-design-git-feature-ui-design-mikes-projects-pro.vercel.app/', type: 'live' },
      { label: 'GitHub Contribution', url: 'https://github.com/mike2377/figma_design/pull/1', type: 'contribution' },
    ],
  },
  {
    id: 'amigo-consulting-website',
    number: '03',
    title: 'Amigo Consulting Website Redesign',
    description:
      'Professional website redesign work involving frontend implementation and email integration.',
    features: ['Frontend implementation', 'Email integration'],
    technologies: ['JavaScript', 'HTML', 'CSS', 'PHPMailer'],
    categories: ['Professional Project'],
    screenshots: [
      { ...screenshot('amigo-consulting/amigo-home.webp', 'Amigo Consulting homepage with its navigation and hero section.') },
      { ...screenshot('amigo-consulting/amigo-houserent.webp', 'Amigo Consulting real estate page with property cards.') },
      { ...screenshot('amigo-consulting/amigo-travel.webp', 'Amigo Consulting travel page with destination cards and service statistics.') },
      { ...screenshot('amigo-consulting/amigo-visa.webp', 'Amigo Consulting visa services page with service information and photography.') },
    ],
    links: [{ label: 'Live Website', url: 'https://amigoconsultingcm.com/', type: 'live' }],
  },
  {
    id: 'hr-process-automation',
    number: '04',
    title: 'HR Process Automation & Data Workflows',
    description:
      'An anonymized professional case study covering email-based job application processing, spreadsheet data handling and verification, administrative calculations, and document generation.',
    features: [
      'Power Automate workflow that extracts information from emailed job applications, updates a tracking spreadsheet, and organizes application files into candidate folders',
      'Excel data entry, lookup and verification',
      'Administrative data review and calculations',
      'Automated Word document generation with Mail Merge',
      'Microsoft Copilot-assisted analysis and automation tasks',
    ],
    technologies: ['Microsoft Power Automate', 'Microsoft Excel', 'Microsoft Word', 'VLOOKUP', 'Mail Merge', 'Process Automation', 'Data Processing', 'Microsoft Copilot'],
    categories: ['Professional Experience'],
    screenshots: [],
    links: [],
    confidentialityNotice: 'Confidential professional work — internal company processes and materials are not publicly available.',
  },
  {
    id: 'github-profile-viewer',
    number: '05',
    title: 'GitHub Profile Viewer',
    description:
      'A responsive web application for searching GitHub profiles and viewing public profile information, including avatars, biographies and statistics.',
    features: [
      'GitHub profile search by username',
      'Profile card with avatar, name, username and bio',
      'Public repository, follower and following counts',
      'Loading, error and profile display states',
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'GitHub API', 'Fetch API'],
    categories: ['Independent Project'],
    screenshots: [
      { ...screenshot('github-profile-viewer/Galaxy-Note20-Ultra-127.0.0.1 (2).webp', 'GitHub Profile Viewer showing a profile card with avatar, bio and public account statistics.', { fit: 'contain' }) },
      { ...screenshot('github-profile-viewer/iPhone-13-PRO-127.0.0.1.webp', 'GitHub Profile Viewer in its initial state with the username search field.', { fit: 'contain' }) },
      { ...screenshot('github-profile-viewer/Galaxy-Note20-Ultra-127.0.0.1.webp', 'GitHub Profile Viewer showing a user-not-found message.', { fit: 'contain' }) },
    ],
    links: [
      { label: 'Live App', url: 'https://mike2377.github.io/github_profile/', type: 'live' },
      { label: 'Source Code', url: 'https://github.com/mike2377/github_profile', type: 'source' },
    ],
  },
  {
    id: 'linkly-url-shortener-api',
    number: '06',
    title: 'Linkly — URL Shortener API',
    description:
      'A REST API for creating short URLs, handling redirects, tracking clicks, managing link expiration and exporting click logs as CSV.',
    features: [
      'Short URL creation and redirects',
      'Click tracking and link expiration',
      'Click log export as CSV',
      'Interactive OpenAPI documentation with Swagger UI',
    ],
    technologies: ['Node.js', 'Express 5', 'PostgreSQL', 'Zod', 'OpenAPI', 'Swagger UI'],
    categories: ['Independent Project'],
    screenshots: [
      { ...screenshot('linkly/create-request.webp', 'Swagger UI request form for creating a short URL.', { caption: 'URL creation — request', fit: 'contain' }) },
      { ...screenshot('linkly/create-response.webp', 'Swagger UI showing a successful short URL creation response.', { caption: 'URL creation — response', fit: 'contain' }) },
      { ...screenshot('linkly/clicks-request.webp', 'Swagger UI request form for retrieving a short link click log.', { caption: 'Click tracking — request', fit: 'contain' }) },
      { ...screenshot('linkly/clicks-response.webp', 'Swagger UI response containing click log data for a short link.', { caption: 'Click tracking — response', fit: 'contain' }) },
      { ...screenshot('linkly/csv-request.webp', 'Swagger UI request form for exporting a short link click log as CSV.', { caption: 'CSV export — request', fit: 'contain' }) },
      { ...screenshot('linkly/csv-response.webp', 'Swagger UI response for a short link click log CSV export.', { caption: 'CSV export — response', fit: 'contain' }) },
      { ...screenshot('linkly/conflict-request.webp', 'Swagger UI request form using a short code that already exists.', { caption: 'Conflict handling — request', fit: 'contain' }) },
      { ...screenshot('linkly/conflict-response.webp', 'Swagger UI showing the conflict response for an already-used short code.', { caption: 'Conflict handling — response', fit: 'contain' }) },
    ],
    links: [
      { label: 'API Documentation', url: 'https://url-linkly.onrender.com/docs/', type: 'documentation' },
      { label: 'Source Code', url: 'https://github.com/mike2377/url_linkly', type: 'source' },
    ],
  },
];
