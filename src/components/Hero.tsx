import { ArrowRight, MapPin } from 'lucide-react';
import { profile } from '@/data/profile';

const codeLines: { text: string; className: string }[][] = [
  [{ text: 'const ', className: 'text-secondary-300' }, { text: 'engineer', className: 'text-ink' }, { text: ' = {', className: 'text-muted' }],
  [{ text: '  fullName: ', className: 'text-muted' }, { text: JSON.stringify(profile.fullName), className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  name: ', className: 'text-muted' }, { text: JSON.stringify(profile.name), className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  role: ', className: 'text-muted' }, { text: JSON.stringify(profile.title), className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  focus: ', className: 'text-muted' }, { text: `[${profile.focusAreas.map((area) => JSON.stringify(area)).join(', ')}]`, className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  location: ', className: 'text-muted' }, { text: JSON.stringify(profile.location), className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  languages: ', className: 'text-muted' }, { text: `{ ${profile.languages.map(({ name, level }) => `${name.toLowerCase()}: ${JSON.stringify(level)}`).join(', ')} }`, className: 'text-success-300' }, { text: ',', className: 'text-muted' }],
  [{ text: '  mission: ', className: 'text-muted' }, { text: '"Useful digital products"', className: 'text-success-300' }],
  [{ text: '};', className: 'text-muted' }],
];

export default function Hero() {
  return (
    <section
      id="home"
      tabIndex={-1}
      className="section-anchor relative isolate flex min-h-screen items-center overflow-hidden pt-28 pb-20 focus:outline-none sm:pb-24 lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(30_42_61/0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgb(30_42_61/0.45)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10%] -z-10 h-[32rem] w-[32rem] rounded-full bg-primary-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 left-[-8%] -z-10 h-[24rem] w-[24rem] rounded-full bg-secondary-400/10 blur-3xl"
      />

      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-7 animate-fade-up">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-panel/80 px-4 py-2 text-sm text-muted backdrop-blur">
            <MapPin size={15} className="text-secondary-400" aria-hidden="true" />
            <span>{profile.location}</span>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-4">
            <p className="max-w-full break-words text-sm font-semibold uppercase tracking-[0.1em] text-secondary-400 sm:tracking-[0.2em]">{profile.title}</p>
            <h1 className="w-full min-w-0 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {profile.headline}
            </h1>
          </div>

          <p className="w-full min-w-0 max-w-xl break-words text-base leading-relaxed text-muted sm:text-lg">{profile.intro}</p>

          <div className="flex w-full min-w-0 flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <a
              href="#projects"
              className="group inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-primary-500/40 sm:w-auto"
            >
              Explore My Work
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-500 bg-card/60 px-6 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-400/60 hover:text-secondary-300 sm:w-auto"
            >
              Get in Touch
            </a>
          </div>
        </div>

        <div className="min-w-0 animate-fade-up [animation-delay:150ms]">
          <div className="relative min-w-0 max-w-full rounded-xl border border-line bg-panel/90 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-error-500/80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-warning-500/80" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-success-500/80" aria-hidden="true" />
              <span className="ml-3 text-xs text-muted">engineer.ts</span>
            </div>
            <pre className="block min-w-0 max-w-full overflow-x-auto whitespace-pre p-4 font-mono text-[13px] leading-7 sm:p-6 sm:text-sm">
              <code className="block w-max min-w-full">
                {codeLines.map((tokens, lineIndex) => (
                  <span key={lineIndex} className="block">
                    <span className="mr-4 inline-block w-4 select-none text-right text-slate-400">{lineIndex + 1}</span>
                    {tokens.map((token, tokenIndex) => (
                      <span key={tokenIndex} className={token.className}>
                        {token.text}
                      </span>
                    ))}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
