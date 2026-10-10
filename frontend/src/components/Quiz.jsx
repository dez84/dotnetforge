'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { Icon } from './Icons';

// Inline quiz with instant feedback. Grades server-side so answers never ship
// to the client.
export function Quiz({ lessonId, questions = [], onGraded }) {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);

  if (!questions.length) return null;

  async function choose(question, optionId) {
    if (results[question.id]) return; // locked once answered
    setBusy(true);
    try {
      const res = await api.answer(lessonId, question.id, optionId);
      setAnswers((a) => ({ ...a, [question.id]: optionId }));
      setResults((r) => ({ ...r, [question.id]: res }));
      // report score upward once every question is graded
      const nextResults = { ...results, [question.id]: res };
      if (Object.keys(nextResults).length === questions.length) {
        const correct = Object.values(nextResults).filter((r) => r.correct).length;
        onGraded?.(correct, questions.length);
      }
    } catch {
      /* surfaced via disabled state */
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-forge-muted">
        <Icon name="sparkles" size={16} /> Knowledge Check
      </h3>
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const result = results[q.id];
          return (
            <div key={q.id}>
              <p className="mb-3 font-medium">
                <span className="mr-2 text-forge-muted">{qi + 1}.</span>
                {q.prompt}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt) => {
                  const chosen = answers[q.id] === opt.id;
                  const isCorrect = result && result.correctId === opt.id;
                  const isWrongChoice = result && chosen && !result.correct;
                  const base =
                    'flex items-center gap-3 rounded-xl border px-4 min-h-touch text-left text-sm transition';
                  const state = !result
                    ? 'border-forge-border bg-forge-panel2 hover:border-forge-brand'
                    : isCorrect
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : isWrongChoice
                        ? 'border-rose-500/60 bg-rose-500/10'
                        : 'border-forge-border opacity-60';
                  return (
                    <button
                      key={opt.id}
                      disabled={busy || !!result}
                      onClick={() => choose(q, opt.id)}
                      className={`${base} ${state}`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-forge-border text-xs">
                        {String(opt.id).toUpperCase()}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {isCorrect && <Icon name="check" size={16} className="text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
              {result && (
                <p
                  className={`mt-3 animate-fadeUp rounded-xl border px-4 py-3 text-sm ${
                    result.correct
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-500/5 text-rose-200'
                  }`}
                >
                  <strong>{result.correct ? 'Correct. ' : 'Not quite. '}</strong>
                  {result.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
