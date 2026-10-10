import { Router } from 'express';
import { ApiError } from '../middleware/errors.js';

export const assistRouter = Router();

// Lightweight, dependency-free "Explain Code & Refactor" helper.
// It applies a set of well-known idiomatic C# transforms so the feature works
// offline. A real deployment would call an LLM here behind the same contract.
const RULES = [
  {
    id: 'class-to-record',
    test: (src) => /class\s+\w+\s*\{/.test(src) && !/record/.test(src),
    message:
      'This looks like a DTO. Consider a `record` (or `record struct`) to get value equality and immutability for free.',
  },
  {
    id: 'for-to-linq',
    test: (src) => /foreach\s*\(.*\).*\n.*\.Add\(/.test(src),
    message:
      'This loop builds a new collection. A LINQ `Select(...).ToList()` expresses the same intent more concisely.',
  },
  {
    id: 'null-check',
    test: (src) => /if\s*\(\s*\w+\s*!=\s*null\s*\)/.test(src),
    message:
      'Prefer the null-conditional operator (`?.`) or pattern `is not null` instead of an explicit `!= null` check.',
  },
  {
    id: 'manual-prop',
    test: (src) => /get\s*\{\s*return/.test(src),
    message:
      'Expression-bodied members read better: `public string Name => _name;`.',
  },
  {
    id: 'blocking-async',
    test: (src) => /\.Result\b|\.Wait\(\)/.test(src),
    message:
      'Blocking on async code with `.Result`/`.Wait()` risks deadlocks. Await the task instead.',
  },
];

assistRouter.post('/explain', (req, res, next) => {
  try {
    const source = String(req.body?.source || '');
    if (!source.trim()) throw new ApiError(400, 'source is required');

    const notes = RULES.filter((r) => {
      try {
        return r.test(source);
      } catch {
        return false;
      }
    }).map((r) => ({ id: r.id, message: r.message }));

    const summary = notes.length
      ? `Found ${notes.length} idiomatic-improvement suggestion${notes.length > 1 ? 's' : ''}.`
      : 'No obvious modernization opportunities detected — this code already looks idiomatic.';

    res.json({
      summary,
      suggestions: notes,
      lines: source.split('\n').length,
      chars: source.length,
    });
  } catch (err) {
    next(err);
  }
});
