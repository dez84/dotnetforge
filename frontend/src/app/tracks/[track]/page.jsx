'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icons';

export default function TrackPage({ params }) {
  const { track: slug } = params;
  const [track, setTrack] = useState(null);
  const [error, setError] = useState(null);
  const [openModule, setOpenModule] = useState(null);

  useEffect(() => {
    api.track(slug).then((t) => {
      setTrack(t);
      setOpenModule(t.modules[0]?.id ?? null);
    }).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="text-rose-300">{error}</p>;
  if (!track) return <p className="text-forge-muted">Loading track…</p>;

  return (
    <div className="animate-fadeUp">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-forge-muted hover:text-forge-text">
        <Icon name="chevron" size={14} className="rotate-180" /> Dashboard
      </Link>

      <header className="card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: track.accent }} />
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: `${track.accent}22`, color: track.accent }}
          >
            <Icon name={track.icon} size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{track.title}</h1>
            <p className="text-forge-muted">{track.subtitle}</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-forge-text/85">{track.description}</p>
      </header>

      <div className="mt-6 space-y-3">
        {track.modules.map((m, mi) => {
          const open = openModule === m.id;
          return (
            <section key={m.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenModule(open ? null : m.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-forge-panel2 text-sm font-bold text-forge-muted">
                  {mi + 1}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="block text-sm text-forge-muted">{m.summary}</span>
                </span>
                <span className="chip hidden sm:inline">{m.lessons.length} lessons</span>
                <Icon name="chevron" size={18} className={`transition ${open ? 'rotate-90' : ''}`} />
              </button>

              {open && (
                <ul className="border-t border-forge-border">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/lessons/${l.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-forge-panel2"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-forge-border text-forge-muted">
                          <Icon name="play" size={13} />
                        </span>
                        <span className="flex-1 font-medium">{l.title}</span>
                        <span className="text-xs text-forge-muted">{l.est_minutes} min</span>
                        {l.quiz_count > 0 && <span className="chip">quiz</span>}
                        <Icon name="chevron" size={16} className="text-forge-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
