'use client';

import { useMemo, useState } from 'react';
import { highlight } from '../lib/highlight';
import { api } from '../lib/api';
import { Icon } from './Icons';

// Browser-based C# snippet playground. It performs client-side syntax checks
// (delimiter balancing, common mistakes) so learners get instant feedback
// without a server round-trip, and offers the AI "Explain & Refactor" helper.
const STARTER = `public record Product(string Name, decimal Price);

var products = new[]
{
    new Product("Keyboard", 49.99m),
    new Product("Mouse", 19.99m),
};

var total = products.Sum(p => p.Price);
Console.WriteLine($"Total: {total:C}");
`;

function lint(code) {
  const issues = [];
  const pairs = { '(': ')', '[': ']', '{': '}' };
  const stack = [];
  let inString = false;
  let inComment = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];
    if (inComment) {
      if (ch === '\n') inComment = false;
      continue;
    }
    if (inString) {
      if (ch === '"' && code[i - 1] !== '\\') inString = false;
      continue;
    }
    if (ch === '/' && next === '/') { inComment = true; continue; }
    if (ch === '"') { inString = true; continue; }
    if (pairs[ch]) stack.push({ ch, i });
    else if (Object.values(pairs).includes(ch)) {
      const top = stack.pop();
      if (!top || pairs[top.ch] !== ch) {
        issues.push(`Unmatched '${ch}' near character ${i}.`);
      }
    }
  }
  if (inString) issues.push('Unterminated string literal.');
  if (stack.length) {
    issues.push(`Unclosed '${stack[stack.length - 1].ch}' — expected '${pairs[stack[stack.length - 1].ch]}'.`);
  }
  if (/\.Result\b|\.Wait\(\)/.test(code)) {
    issues.push('Avoid .Result/.Wait() on async code — it can deadlock. Use await.');
  }
  if (/Console\.WriteLine/.test(code) === false && code.trim().length > 0) {
    issues.push('Tip: call Console.WriteLine(...) to print output.');
  }
  return issues;
}

export function CodeSandbox({ lessonId }) {
  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState(null);
  const [issues, setIssues] = useState([]);
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState(false);

  const storageKey = useMemo(() => `dotnetforge.sandbox.${lessonId || 'global'}`, [lessonId]);

  function run() {
    const found = lint(code);
    setIssues(found);
    setOutput(
      found.length
        ? '✗ Syntax check failed — see issues below.'
        : '✓ Syntax check passed. (Browser sandbox validates structure; run in WSL for full compilation.)'
    );
    try {
      localStorage.setItem(storageKey, code);
    } catch {
      /* storage unavailable */
    }
  }

  async function explain() {
    setBusy(true);
    setAi(null);
    try {
      const res = await api.explain(code);
      setAi(res);
    } catch (e) {
      setAi({ summary: e.message, suggestions: [] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-forge-border px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-forge-muted">
          <Icon name="code" size={14} /> C# Sandbox
        </span>
        <div className="flex gap-2">
          <button onClick={explain} disabled={busy} className="btn-ghost !min-h-0 !px-3 !py-1.5 text-xs">
            <Icon name="sparkles" size={14} /> {busy ? 'Thinking…' : 'Explain & Refactor'}
          </button>
          <button onClick={run} className="btn-primary !min-h-0 !px-3 !py-1.5 text-xs">
            <Icon name="play" size={14} /> Run check
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-64 w-full resize-y bg-[#05070d] p-4 font-mono text-[13px] leading-relaxed
                     text-forge-text outline-none lg:h-80"
          aria-label="C# code editor"
        />
        <div className="border-t border-forge-border lg:border-l lg:border-t-0">
          <pre
            className="h-64 overflow-auto p-4 font-mono text-[13px] leading-relaxed lg:h-80"
            dangerouslySetInnerHTML={{ __html: highlight(code, 'csharp') }}
          />
        </div>
      </div>

      {(output || issues.length > 0 || ai) && (
        <div className="space-y-3 border-t border-forge-border bg-forge-panel2 p-4 text-sm">
          {output && (
            <p className={output.startsWith('✓') ? 'text-emerald-300' : 'text-rose-300'}>{output}</p>
          )}
          {issues.length > 0 && (
            <ul className="space-y-1 text-forge-muted">
              {issues.map((it, i) => (
                <li key={i}>• {it}</li>
              ))}
            </ul>
          )}
          {ai && (
            <div className="rounded-xl border border-forge-brand/40 bg-forge-brand/5 p-3">
              <p className="mb-2 flex items-center gap-2 font-semibold text-indigo-200">
                <Icon name="sparkles" size={14} /> {ai.summary}
              </p>
              <ul className="space-y-1 text-forge-muted">
                {ai.suggestions.map((s) => (
                  <li key={s.id}>• {s.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
