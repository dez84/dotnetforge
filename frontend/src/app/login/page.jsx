'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Icon } from '../../components/Icons';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', displayName: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.displayName, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function demo() {
    setBusy(true);
    setError(null);
    try {
      await login('demo@dotnetforge.dev', 'forge1234');
      router.push('/dashboard');
    } catch (err) {
      // demo user may not exist yet — fall back to registering a fresh one
      try {
        await register(`learner${Date.now()}@forge.dev`, 'Forge Learner', 'forge1234');
        router.push('/dashboard');
      } catch (e2) {
        setError(e2.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fadeUp">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-forge-muted">Progress syncs across desktop and mobile.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Field label="Display name">
              <input className="input" value={form.displayName} onChange={set('displayName')} required />
            </Field>
          )}
          <Field label="Email">
            <input type="email" className="input" value={form.email} onChange={set('email')} required />
          </Field>
          <Field label="Password">
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={set('password')}
              minLength={8}
              required
            />
          </Field>

          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button onClick={demo} disabled={busy} className="btn-ghost mt-3 w-full">
          <Icon name="play" size={16} /> Try the demo account
        </button>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="mt-4 w-full text-center text-sm text-forge-muted hover:text-forge-text"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #232c42;
          background: #161d2f;
          padding: 0.75rem 1rem;
          min-height: 48px;
          color: #e6ecff;
          outline: none;
        }
        .input:focus {
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-forge-muted">{label}</span>
      {children}
    </label>
  );
}
