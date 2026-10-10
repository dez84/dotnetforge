'use client';

import { useState } from 'react';
import { highlight } from '../lib/highlight';
import { Icon } from './Icons';

// Code block with syntax highlighting and a horizontal-scroll surface for
// mobile, plus a copy button. Mirrors the "code blocks with horizontal scroll"
// requirement in the UI guidelines.
export function CodeBlock({ code, language = 'csharp', title }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-forge-border bg-[#05070d]">
      <div className="flex items-center justify-between border-b border-forge-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-forge-muted">
          {title || language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-forge-muted
                     hover:bg-forge-panel2 hover:text-forge-text"
          aria-label="Copy code"
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
      </pre>
    </div>
  );
}
