'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { LessonContent } from '../../../components/LessonContent';
import { Quiz } from '../../../components/Quiz';
import { CodeSandbox } from '../../../components/CodeSandbox';
import { PatternGame } from '../../../components/PatternGame';
import { Icon } from '../../../components/Icons';

// Patterns shown in the match game when a lesson lives in the OOP module.
const PATTERNS = [
  { slug: 'singleton', name: 'Singleton', category: 'creational', intent: 'One shared instance with global access.', code_hint: 'public sealed class Registry { public static Registry Instance { get; } = new(); }' },
  { slug: 'factory-method', name: 'Factory Method', category: 'creational', intent: 'Let subclasses choose the concrete type.', code_hint: 'public IExporter Create() => new CsvExporter();' },
  { slug: 'repository', name: 'Repository', category: 'structural', intent: 'Keep persistence out of business logic.', code_hint: 'public interface IOrderRepository { Task<Order?> FindAsync(Guid id); }' },
  { slug: 'decorator', name: 'Decorator', category: 'structural', intent: 'Add behaviour by wrapping.', code_hint: 'public class LoggingService(IService inner) : IService' },
];

export default function LessonPage({ params }) {
  const { id } = params;
  const { token, user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.lesson(id).then(setLesson).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (token && lesson) {
      api.saveLesson(token, lesson.id, 'in_progress').catch(() => {});
    }
  }, [token, lesson]);

  async function markComplete(score, total) {
    if (!token) return;
    try {
      await api.saveLesson(token, lesson.id, 'completed', Math.round((score / total) * 100));
      setSaved(true);
    } catch {
      /* ignore */
    }
  }

  if (error) return <p className="text-rose-300">{error}</p>;
  if (!lesson) return <p className="text-forge-muted">Loading lesson…</p>;

  const showPatternGame = lesson.module_slug === 'oop-foundations';

  return (
    <div className="animate-fadeUp mx-auto max-w-4xl">
      <Link
        href={`/tracks/${lesson.track_slug}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-forge-muted hover:text-forge-text"
      >
        <Icon name="chevron" size={14} className="rotate-180" /> {lesson.track_title}
      </Link>

      <header className="mb-6">
        <p className="text-sm font-medium" style={{ color: lesson.track_accent }}>
          {lesson.module_title}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-forge-muted">
          <span className="flex items-center gap-1">
            <Icon name="activity" size={14} /> {lesson.est_minutes} min
          </span>
          {saved && (
            <span className="flex items-center gap-1 text-emerald-300">
              <Icon name="check" size={14} /> saved
            </span>
          )}
        </div>
      </header>

      <article className="card mb-6 p-6">
        <LessonContent blocks={lesson.content} />
      </article>

      <div className="space-y-6">
        <CodeSandbox lessonId={lesson.id} />
        {showPatternGame && <PatternGame patterns={PATTERNS} />}
        <Quiz lessonId={lesson.id} questions={lesson.quiz} onGraded={markComplete} />

        {!user && (
          <p className="rounded-xl border border-forge-border bg-forge-panel2 px-4 py-3 text-sm text-forge-muted">
            <Link href="/login" className="text-forge-brand2 underline">
              Sign in
            </Link>{' '}
            to save your progress and quiz scores.
          </p>
        )}
      </div>
    </div>
  );
}
