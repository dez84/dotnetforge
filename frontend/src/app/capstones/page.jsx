'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Icon } from '../../components/Icons';

const DIFF = {
  intermediate: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  advanced: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
};

export default function CapstonesPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.capstones().then(setProjects).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="animate-fadeUp space-y-6">
      <header className="rounded-3xl border border-forge-border bg-gradient-to-br from-forge-panel to-forge-bg p-8">
        <span className="chip mb-3">
          <Icon name="rocket" size={13} className="mr-1" /> Portfolio-ready
        </span>
        <h1 className="text-3xl font-bold">Capstone Lab Hub</h1>
        <p className="mt-2 max-w-3xl text-forge-muted">
          Four guided, real-world .NET projects. Each one ships with the objectives, tooling,
          step-by-step WSL/CLI commands, and code deliverables you need to build it end to end on
          VS Code + WSL2.
        </p>
      </header>

      {error && <p className="text-rose-300">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            href={`/capstones/${p.slug}`}
            className="card group relative overflow-hidden p-6 transition hover:border-forge-brand/60"
          >
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: p.accent }} />
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${p.accent}22`, color: p.accent }}
              >
                <Icon name={p.icon} size={24} />
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${DIFF[p.difficulty] || ''}`}>
                {p.difficulty}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-snug group-hover:text-white">
              {p.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted">{p.objective}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tools.slice(0, 4).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-4 text-xs text-forge-muted">
              <span className="flex items-center gap-1">
                <Icon name="layers" size={14} /> {p.step_count} steps
              </span>
              <span className="flex items-center gap-1">
                <Icon name="activity" size={14} /> ~{p.est_hours}h
              </span>
              <span className="ml-auto flex items-center gap-1 text-forge-brand2">
                Open <Icon name="chevron" size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
