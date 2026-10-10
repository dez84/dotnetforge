'use client';

import { useEffect, useMemo, useState } from 'react';
import { highlight } from '../lib/highlight';
import { Icon } from './Icons';

// Mobile-friendly matching game: pair each design pattern with its code hint.
// Uses HTML5 drag & drop on desktop and tap-to-select on touch devices.
export function PatternGame({ patterns = [] }) {
  const [selected, setSelected] = useState(null); // pattern slug being placed
  const [placed, setPlaced] = useState({}); // patternSlug -> matched hint id
  const [wrong, setWrong] = useState(null);

  const hints = useMemo(
    () => patterns.map((p) => ({ id: p.slug, code: p.code_hint })).sort(() => 0.5 - Math.random()),
    [patterns]
  );

  const solvedCount = Object.keys(placed).length;
  const done = solvedCount === patterns.length && patterns.length > 0;

  function tryPlace(hintId) {
    if (!selected) return;
    if (hintId === selected) {
      setPlaced((p) => ({ ...p, [selected]: hintId }));
      setSelected(null);
      setWrong(null);
    } else {
      setWrong(hintId);
      setTimeout(() => setWrong(null), 700);
    }
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-forge-muted">
          <Icon name="layers" size={16} /> Match the Pattern
        </h3>
        <span className="chip">
          {solvedCount}/{patterns.length} solved
        </span>
      </div>

      <p className="mb-4 text-sm text-forge-muted">
        Select a pattern, then tap the code snippet that implements it.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {patterns.map((p) => {
            const isPlaced = placed[p.slug];
            const isSel = selected === p.slug;
            return (
              <button
                key={p.slug}
                draggable={!isPlaced}
                onDragStart={() => setSelected(p.slug)}
                onClick={() => !isPlaced && setSelected(isSel ? null : p.slug)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition min-h-touch ${
                  isPlaced
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : isSel
                      ? 'border-forge-brand bg-forge-brand/10'
                      : 'border-forge-border bg-forge-panel2 hover:border-forge-brand/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.name}</span>
                  <span className="chip">{p.category}</span>
                </div>
                <p className="mt-1 text-xs text-forge-muted">{p.intent}</p>
                {isPlaced && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-300">
                    <Icon name="check" size={13} /> matched
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {hints.map((h) => {
            const taken = Object.values(placed).includes(h.id);
            return (
              <button
                key={h.id}
                disabled={taken}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => tryPlace(h.id)}
                onClick={() => tryPlace(h.id)}
                className={`block w-full overflow-x-auto rounded-xl border p-3 text-left font-mono text-[12px] transition ${
                  taken
                    ? 'border-emerald-500/40 bg-emerald-500/5 opacity-60'
                    : wrong === h.id
                      ? 'animate-pulse border-rose-500 bg-rose-500/10'
                      : 'border-forge-border bg-[#05070d] hover:border-forge-brand/60'
                }`}
              >
                <code dangerouslySetInnerHTML={{ __html: highlight(h.code, 'csharp') }} />
              </button>
            );
          })}
        </div>
      </div>

      {done && (
        <p className="mt-4 animate-fadeUp rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <Icon name="check" size={15} className="mr-2 inline" />
          All patterns matched. You can recognise each one by its intent and shape.
        </p>
      )}
    </section>
  );
}
