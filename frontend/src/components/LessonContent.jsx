import { CodeBlock } from './CodeBlock';
import { TerminalGuide } from './TerminalGuide';
import { Icon } from './Icons';

const CALLOUT = {
  tip: { cls: 'border-emerald-500/40 bg-emerald-500/5', icon: 'sparkles', color: 'text-emerald-300' },
  warning: { cls: 'border-amber-500/40 bg-amber-500/5', icon: 'shield', color: 'text-amber-300' },
  info: { cls: 'border-sky-500/40 bg-sky-500/5', icon: 'sparkles', color: 'text-sky-300' },
};

// Renders the JSONB content-block array stored per lesson.
export function LessonContent({ blocks = [] }) {
  return (
    <div className="space-y-1">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return (
              <p key={i} className="my-3 leading-relaxed text-forge-text/90">
                {b.text}
              </p>
            );
          case 'list':
            return (
              <ul key={i} className="my-3 space-y-2">
                {b.items?.map((it, j) => (
                  <li key={j} className="flex gap-3 leading-relaxed text-forge-text/90">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forge-brand" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return <CodeBlock key={i} code={b.code} language={b.language} />;
          case 'terminal':
            return <TerminalGuide key={i} commands={b.commands} />;
          case 'callout': {
            const c = CALLOUT[b.variant] || CALLOUT.info;
            return (
              <aside key={i} className={`my-4 rounded-xl border p-4 ${c.cls}`}>
                <p className={`mb-1 flex items-center gap-2 text-sm font-semibold ${c.color}`}>
                  <Icon name={c.icon} size={16} /> {b.title}
                </p>
                <p className="text-sm leading-relaxed text-forge-text/85">{b.body}</p>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
