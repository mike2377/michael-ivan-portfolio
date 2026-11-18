import Reveal from '@/components/Reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center items-center' : 'items-start text-left';

  return (
    <Reveal className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-400">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </Reveal>
  );
}
