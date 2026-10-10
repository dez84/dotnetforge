'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { CodeBlock } from '../../../components/CodeBlock';
import { TerminalGuide } from '../../../components/TerminalGuide';
import { Icon } from '../../../components/Icons';

export default function CapstoneDetailPage({ params }) {
  const { slug } = params;
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [done, setDone] = useState({});

  useEffect(() => {
    api
      .capstone(slug)
      .then(setProject)
      .catch((e) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (token) {
      api
        .progress(token)
        .then((p) => {
          const ids = p.completedStepIds || [];
          const map = {};
          for (const id of ids) map[id] = true;
          setDone(map);
        })
        .catch(() => {});
    }
  }, [token]);

  async function toggleStep(stepId) {
    const next = !done[stepId];
    setDone((d) => ({ ...d, [stepId]: next }));
    if (token) {
      try {
        await api.saveStep(token, stepId, next);
      } catch {
        setDone((d) => ({ ...d, [stepId]: !next })); // revert on failure
      }
    }
  }

  if (error) return <p className="text-rose-300">{error}</p>;
  if (!project) return <p className="text-forge-muted">Loading project…</p>;

  const completed = project.steps.filter((s) => done[s.id]).length;
  const pct = Math.round((completed / Math.max(project.steps.length, 1)) * 100);

  return (
    <div className="animate-fadeUp mx-auto max-w-4xl">
      <Link href="/capstones" className="mb-4 inline-flex items-center gap-1 text-sm text-forge-muted hover:text-forge-text">
        <Icon name="chevron" size={14} className="rotate-180" /> Capstone Lab Hub
      </Link>

      <header className="card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: project.accent }} />
        <div className="flex items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
            style={{ background: `${project.accent}22`, color: project.accent }}
          >
            <Icon name={project.icon} size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-forge-text/85">{project.objective}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tools.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-forge-muted">
            <span>Project progress</span>
            <span>
              {completed}/{project.steps.length} steps · {pct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-forge-panel2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: project.accent }}
            />
          </div>
        </div>
      </header>

      <section className="card mt-6 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-forge-muted">
          <Icon name="check" size={16} /> Deliverables
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {project.deliverables.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm">
              <Icon name="check" size={15} className="mt-0.5 shrink-0 text-emerald-400" />
              {d}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 space-y-4">
        {project.steps.map((s, i) => {
          const isDone = !!done[s.id];
          return (
            <section key={s.id} className={`card overflow-hidden ${isDone ? 'border-emerald-500/40' : ''}`}>
              <div className="flex items-center gap-3 border-b border-forge-border px-5 py-4">
                <button
                  onClick={() => toggleStep(s.id)}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-forge-border text-forge-muted hover:border-forge-brand'
                  }`}
                  aria-label={isDone ? 'Mark step incomplete' : 'Mark step complete'}
                >
                  {isDone ? <Icon name="check" size={16} /> : <span className="text-sm font-bold">{i + 1}</span>}
                </button>
                <h3 className={`flex-1 font-semibold ${isDone ? 'text-emerald-200' : ''}`}>{s.title}</h3>
                {isDone && <span className="chip border-emerald-500/40 text-emerald-300">done</span>}
              </div>

              <div className="px-5 py-4">
                {s.body && <p className="mb-3 text-sm leading-relaxed text-forge-text/85">{s.body}</p>}
                {s.commands?.length > 0 && <TerminalGuide commands={s.commands} />}
                {s.code && (
                  <CodeBlock code={s.code} language={s.code_language} title={s.code_language} />
                )}
              </div>
            </section>
          );
        })}
      </div>

      {!user && (
        <p className="mt-6 rounded-xl border border-forge-border bg-forge-panel2 px-4 py-3 text-sm text-forge-muted">
          <Link href="/login" className="text-forge-brand2 underline">
            Sign in
          </Link>{' '}
          to save your project step progress across devices.
        </p>
      )}
    </div>
  );
}
