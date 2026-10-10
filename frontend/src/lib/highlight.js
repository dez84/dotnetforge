// Minimal, dependency-free syntax highlighter for the languages DotNetForge
// teaches. Implemented as a single-pass scanner (not stacked regexes) so that
// tokens never corrupt one another. Output is HTML-escaped, so the returned
// string is safe to pass to dangerouslySetInnerHTML.

const KEYWORDS = {
  csharp: new Set([
    'public','private','protected','internal','static','readonly','sealed','class','record','struct',
    'interface','enum','abstract','virtual','override','async','await','return','var','new','this',
    'base','using','namespace','if','else','switch','case','when','default','for','foreach','while',
    'try','catch','finally','throw','in','out','ref','is','not','null','true','false','void','int',
    'string','decimal','bool','double','get','set','init','where','select','from','with','nameof',
  ]),
  bash: new Set([
    'docker','dotnet','cd','mkdir','export','sudo','apt','npm','npx','git','curl','run','new','ef',
    'add','update','build','compose','exec','and','sln','reference','package','migrations','database',
  ]),
  dockerfile: new Set([
    'FROM','WORKDIR','COPY','RUN','ENTRYPOINT','CMD','EXPOSE','ENV','AS',
  ]),
};

function esc(str) {
  return str.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
}

export function highlight(code, language = 'csharp') {
  const lang = (language || 'csharp').toLowerCase();
  const keywords = KEYWORDS[lang] || KEYWORDS.csharp;
  const lineComment = lang === 'dockerfile' ? null : '//';
  const hashComment = lang === 'bash' || lang === 'dockerfile';

  let out = '';
  let i = 0;
  const n = code.length;

  const isIdentStart = (c) => /[A-Za-z_]/.test(c);
  const isIdentPart = (c) => /[A-Za-z0-9_]/.test(c);

  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];

    // Line comments: // for C#, # for shell/dockerfile at the start of a token.
    if (lineComment && ch === '/' && next === '/') {
      let j = i;
      while (j < n && code[j] !== '\n') j++;
      out += `<span class="tok-comment">${esc(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (hashComment && ch === '#' && (i === 0 || /\s/.test(code[i - 1]))) {
      let j = i;
      while (j < n && code[j] !== '\n') j++;
      out += `<span class="tok-comment">${esc(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // String literals (double quoted, with basic escape handling).
    if (ch === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '"') { j++; break; }
        j++;
      }
      out += `<span class="tok-string">${esc(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Numbers (including decimals and the m/f/d suffix).
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < n && /[0-9._]/.test(code[j])) j++;
      if (code[j] === 'm' || code[j] === 'f' || code[j] === 'd') j++;
      out += `<span class="tok-number">${esc(code.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Identifiers / keywords.
    if (isIdentStart(ch)) {
      let j = i;
      while (j < n && isIdentPart(code[j])) j++;
      const word = code.slice(i, j);
      const isKw =
        keywords.has(word) || (lang === 'dockerfile' && keywords.has(word.toUpperCase()));
      if (isKw) {
        const cls = lang === 'bash' || lang === 'dockerfile' ? 'tok-builtin' : 'tok-keyword';
        out += `<span class="${cls}">${esc(word)}</span>`;
      } else {
        out += esc(word);
      }
      i = j;
      continue;
    }

    out += esc(ch);
    i++;
  }

  return out;
}
