'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Icon } from '../../components/Icons';

function TrackCard({ track }) {
  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="card group relative overflow-hidden p-5 transition hover:border-forge-brand/60"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${track.accent}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: `${track.accent}22`, color: track.accent }}
        >
          <Icon name={track.icon} size={22} />
        </span>
        <span className="chip">{track.module_count} modules</span>
      </div>
      <h3 className="mt-4 font-semibold leading-snug group-hover:text-white">{track.title}</h3>
      <p className="mt-1 text-sm text-forge-muted">{track.subtitle}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-forge-muted">
        <span className="flex items-center gap-1">
          <Icon name="code" size={14} /> {track.lesson_count} lessons
        </span>
        <span className="ml-auto flex items-center gap-1 text-forge-brand2">
          Open <Icon name="chevron" size={14} />
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { token, user, ready } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.tracks().then(setTracks).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (token) api.progress(token).then(setProgress).catch(() => {});
  }, [token]);

  const learning = tracks.filter((t) => !t.is_capstone);
  const capstone = tracks.find((t) => t.is_capstone);
  const overall = progress
    ? Math.round((progress.lessonsCompleted / Math.max(progress.lessonsTotal, 1)) * 100)
    : 0;

  return (
    <div className="animate-fadeUp space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-forge-muted">
            {user ? `Welcome back, ${user.displayName}.` : 'Welcome to DotNetForge.'}
          </p>
          <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
        </div>
        {!user && ready && (
          <Link href="/login" className="btn-primary">
            <Icon name="user" size={16} /> Sign in to sync progress
          </Link>
        )}
      </section>

      {user && progress && (
        <section className="card p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative grid h-20 w-20 place-items-center">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#232c42" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${overall} 100`}
                  />
                </svg>
                <span className="absolute text-lg font-bold">{overall}%</span>
              </div>
              <div>
                <p className="text-sm text-forge-muted">Overall progress</p>
                <p className="text-xl font-semibold">
                  {progress.lessonsCompleted}/{progress.lessonsTotal} lessons complete
                </p>
                <p className="mt-1 text-xs text-forge-muted">
                  Capstone steps: {progress.capstone.completed}/{progress.capstone.total}
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {progress.byTrack.map((t) => {
                const pct = Math.round((t.completed / Math.max(t.total, 1)) * 100);
                return (
                  <div key={t.slug}>
                    <div className="mb-1 flex justify-between text-xs text-forge-muted">
                      <span>{t.title}</span>
                      <span>
                        {t.completed}/{t.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-forge-panel2">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Core Domain Tracks</h2>
        {error && <p className="text-rose-300">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {learning.map((t) => (
            <TrackCard key={t.slug} track={t} />
          ))}
        </div>
      </section>

      {capstone && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Capstone Lab Hub</h2>
          <Link
            href="/capstones"
            className="card flex items-center justify-between gap-4 border-forge-brand/40 p-6 transition hover:border-forge-brand"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forge-brand/15 text-forge-brand2">
                <Icon name="rocket" size={28} />
              </span>
              <div>
                <h3 className="text-lg font-semibold">{capstone.title}</h3>
                <p className="text-sm text-forge-muted">{capstone.subtitle}</p>
              </div>
            </div>
            <Icon name="chevron" size={24} className="text-forge-brand2" />
          </Link>
        </section>
      )}
    </div>
  );
}
