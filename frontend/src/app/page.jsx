import Link from 'next/link';
import { Icon } from '../components/Icons';

const FEATURES = [
  { icon: 'code', title: 'Interactive C# sandbox', body: 'Write and syntax-check idiomatic C# right in the browser.' },
  { icon: 'sparkles', title: 'Explain & Refactor', body: 'AI-style hints that modernise classic C# into records and LINQ.' },
  { icon: 'layers', title: 'Match the pattern', body: 'Drag-and-drop games for Factory, Singleton, Repository, and more.' },
  { icon: 'terminal', title: 'WSL/CLI guides', body: 'Copy-ready dotnet, docker, and EF Core commands for every step.' },
];

export default function HomePage() {
  return (
    <div className="animate-fadeUp">
      <section className="relative overflow-hidden rounded-3xl border border-forge-border bg-gradient-to-br from-forge-panel to-forge-bg px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-forge-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-forge-brand2/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="chip mx-auto mb-5">
            <Icon name="sparkles" size={13} className="mr-1" /> Duolingo meets .NET docs
          </span>
          <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-6xl">
            Forge modern <span className="text-forge-brand2">C#</span> & .NET skills,
            one bite-sized lesson at a time.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-forge-muted sm:text-lg">
            Master C# 12/13, ASP.NET Core Web APIs, Entity Framework Core, and Blazor — then
            apply it all in four guided capstone projects built for VS Code + WSL2.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn-primary text-base">
              <Icon name="play" size={18} /> Start learning
            </Link>
            <Link href="/capstones" className="btn-ghost text-base">
              <Icon name="rocket" size={18} /> Explore Capstone Lab
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-5">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-forge-brand/15 text-forge-brand2">
              <Icon name={f.icon} size={20} />
            </span>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-forge-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
