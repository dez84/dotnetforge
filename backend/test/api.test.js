import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

async function req(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@forge.dev`;

async function newUser() {
  const email = uniqueEmail();
  const r = await req('/api/auth/register', {
    method: 'POST',
    body: { email, displayName: 'Test Learner', password: 'Passw0rd!' },
  });
  assert.equal(r.status, 201);
  return { email, token: r.body.token, id: r.body.user.id };
}

// --- health -----------------------------------------------------------------

test('GET /api/health reports db up', async () => {
  const r = await req('/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'ok');
  assert.equal(r.body.db, 'up');
});

// --- content ----------------------------------------------------------------

test('GET /api/tracks returns the four domain tracks plus the capstone hub', async () => {
  const r = await req('/api/tracks');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body));
  assert.equal(r.body.length, 5);
  const first = r.body[0];
  assert.ok(first.slug);
  assert.ok(Number.isInteger(first.module_count));
  assert.ok(Number.isInteger(first.lesson_count));
});

test('GET /api/tracks/:slug nests modules and lessons', async () => {
  const list = await req('/api/tracks');
  const slug = list.body.find((t) => !t.is_capstone).slug;
  const r = await req(`/api/tracks/${slug}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.slug, slug);
  assert.ok(Array.isArray(r.body.modules));
  assert.ok(r.body.modules.length > 0);
  assert.ok(Array.isArray(r.body.modules[0].lessons));
});

test('GET /api/tracks/does-not-exist returns 404', async () => {
  const r = await req('/api/tracks/does-not-exist');
  assert.equal(r.status, 404);
  assert.equal(r.body.status, 404);
  assert.ok(r.body.detail);
});

test('GET /api/lessons/:id returns content and quiz without leaking answers', async () => {
  const r = await req('/api/lessons/1');
  assert.equal(r.status, 200);
  assert.ok(r.body.title);
  assert.ok(Array.isArray(r.body.quiz));
  assert.ok(r.body.quiz.length > 0);
  for (const q of r.body.quiz) {
    assert.ok(!('correct_id' in q), 'must not expose correct_id');
    assert.ok(!('correctId' in q), 'must not expose correctId');
  }
});

test('POST /api/lessons/:id/answer grades correct and incorrect', async () => {
  const lesson = await req('/api/lessons/1');
  const q = lesson.body.quiz[0];
  const optionIds = q.options.map((o) => o.id);

  let correctId = null;
  for (const id of optionIds) {
    const probe = await req('/api/lessons/1/answer', {
      method: 'POST',
      body: { questionId: q.id, optionId: id },
    });
    assert.equal(probe.status, 200);
    if (probe.body.correct) correctId = id;
  }
  assert.ok(correctId, 'one option should be correct');

  const good = await req('/api/lessons/1/answer', {
    method: 'POST',
    body: { questionId: q.id, optionId: correctId },
  });
  assert.equal(good.body.correct, true);
  assert.equal(good.body.correctId, correctId);
  assert.ok(good.body.explanation);

  const wrong = await req('/api/lessons/1/answer', {
    method: 'POST',
    body: { questionId: q.id, optionId: 'not-an-option' },
  });
  assert.equal(wrong.body.correct, false);
});

test('POST /api/lessons/:id/answer validates input', async () => {
  const r = await req('/api/lessons/1/answer', { method: 'POST', body: {} });
  assert.equal(r.status, 400);
});

// --- capstones --------------------------------------------------------------

test('GET /api/capstones lists the four projects', async () => {
  const r = await req('/api/capstones');
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 4);
});

test('GET /api/capstones/:slug returns steps with real newlines in code', async () => {
  const r = await req('/api/capstones/redis-rabbitmq-worker');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.steps));
  assert.ok(r.body.steps.length > 0);
  const withCode = r.body.steps.find((s) => s.code);
  assert.ok(withCode, 'at least one step has code');
  assert.ok(!withCode.code.includes('\\n'), 'code must not contain literal backslash-n');
  assert.ok(withCode.code.includes('\n'), 'code should contain real newlines');
});

// --- auth -------------------------------------------------------------------

test('register rejects missing fields and short passwords', async () => {
  const missing = await req('/api/auth/register', {
    method: 'POST',
    body: { email: 'x@forge.dev' },
  });
  assert.equal(missing.status, 400);

  const short = await req('/api/auth/register', {
    method: 'POST',
    body: { email: uniqueEmail(), displayName: 'X', password: 'short' },
  });
  assert.equal(short.status, 400);
});

test('register then duplicate registration conflicts', async () => {
  const email = uniqueEmail();
  const first = await req('/api/auth/register', {
    method: 'POST',
    body: { email, displayName: 'Dup', password: 'Passw0rd!' },
  });
  assert.equal(first.status, 201);
  assert.ok(first.body.token);
  assert.equal(first.body.user.email, email);

  const dup = await req('/api/auth/register', {
    method: 'POST',
    body: { email, displayName: 'Dup', password: 'Passw0rd!' },
  });
  assert.equal(dup.status, 409);
});

test('login succeeds with valid credentials and fails otherwise', async () => {
  const { email } = await newUser();

  const ok = await req('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'Passw0rd!' },
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);

  const bad = await req('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'wrong-password' },
  });
  assert.equal(bad.status, 401);
});

test('GET /api/auth/me requires and honours a token', async () => {
  const anonymous = await req('/api/auth/me');
  assert.equal(anonymous.status, 401);

  const { token, email } = await newUser();
  const me = await req('/api/auth/me', { token });
  assert.equal(me.status, 200);
  assert.equal(me.body.email, email);
});

// --- progress ---------------------------------------------------------------

test('progress endpoints require authentication', async () => {
  assert.equal((await req('/api/progress')).status, 401);
  const save = await req('/api/progress/lessons/1', {
    method: 'POST',
    body: { status: 'completed' },
  });
  assert.equal(save.status, 401);
});

test('lesson progress is recorded and summarized', async () => {
  const { token } = await newUser();

  const saved = await req('/api/progress/lessons/4', {
    method: 'POST',
    token,
    body: { status: 'completed' },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.status, 'completed');

  const summary = await req('/api/progress', { token });
  assert.equal(summary.status, 200);
  assert.ok(summary.body.completedLessonIds.includes(4));
  assert.ok(summary.body.lessonsCompleted >= 1);
});

test('rejects an unknown lesson status', async () => {
  const { token } = await newUser();
  const r = await req('/api/progress/lessons/1', {
    method: 'POST',
    token,
    body: { status: 'nonsense' },
  });
  assert.equal(r.status, 400);
});

test('capstone step progress is recorded; unknown step returns 400', async () => {
  const { token } = await newUser();

  const step = await req('/api/progress/capstone-steps/13', {
    method: 'POST',
    token,
    body: { completed: true },
  });
  assert.equal(step.status, 200);
  assert.equal(step.body.completed, true);

  const summary = await req('/api/progress', { token });
  assert.ok(summary.body.completedStepIds.includes(13));
  assert.equal(summary.body.capstone.completed, 1);

  const bad = await req('/api/progress/capstone-steps/9999', {
    method: 'POST',
    token,
    body: { completed: true },
  });
  assert.equal(bad.status, 400); // FK violation mapped to 400, not 500
});

// --- assist -----------------------------------------------------------------

test('POST /api/assist/explain returns suggestions for non-idiomatic code', async () => {
  const r = await req('/api/assist/explain', {
    method: 'POST',
    body: { source: 'if (x != null) { return x.Result; }' },
  });
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.suggestions));
  assert.ok(r.body.suggestions.length > 0);
  assert.ok(r.body.summary);
});

test('POST /api/assist/explain validates input', async () => {
  const r = await req('/api/assist/explain', { method: 'POST', body: { source: '  ' } });
  assert.equal(r.status, 400);
});

// --- routing ----------------------------------------------------------------

test('unknown routes return an RFC-7807-shaped 404', async () => {
  const r = await req('/api/this/does/not/exist');
  assert.equal(r.status, 404);
  assert.equal(r.body.title, 'Not Found');
  assert.equal(r.body.status, 404);
  assert.equal(r.body.type, 'about:blank');
});
