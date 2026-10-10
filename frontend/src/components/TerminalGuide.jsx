'use client';

import { useState } from 'react';
import { Icon } from './Icons';

// Step-by-step WSL/CLI terminal guide. Each command has a copy affordance and
// a `$ dotnet ...` prompt prefix to reinforce terminal workflows.
export function TerminalGuide({ commands = [] }) {
  const [copiedIdx, setCopiedIdx] = useState(-1);

  async function copy(cmd, idx) {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(-1), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!commands.length) return null;

  return (
    <div className="terminal space-y-1">
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-forge-muted">
        <Icon name="terminal" size={14} /> WSL / CLI
      </div>
      {commands.map((cmd, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="select-none text-emerald-400">$</span>
          <code className="flex-1 whitespace-pre-wrap break-all text-forge-text">{cmd}</code>
          <button
            onClick={() => copy(cmd, i)}
            className="shrink-0 rounded-md p-1 text-forge-muted hover:text-forge-text"
            aria-label="Copy command"
          >
            <Icon name={copiedIdx === i ? 'check' : 'copy'} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
