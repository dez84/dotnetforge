// Small fetch wrapper around the DotNetForge API (same-origin via Next rewrite).
const BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  tracks: () => request('/tracks'),
  track: (slug) => request(`/tracks/${slug}`),
  lesson: (id) => request(`/lessons/${id}`),
  answer: (lessonId, questionId, optionId) =>
    request(`/lessons/${lessonId}/answer`, {
      method: 'POST',
      body: { questionId, optionId },
    }),
  capstones: () => request('/capstones'),
  capstone: (slug) => request(`/capstones/${slug}`),
  progress: (token) => request('/progress', { token }),
  saveLesson: (token, lessonId, status, score) =>
    request(`/progress/lessons/${lessonId}`, {
      method: 'POST',
      token,
      body: { status, score },
    }),
  saveStep: (token, stepId, completed) =>
    request(`/progress/capstone-steps/${stepId}`, {
      method: 'POST',
      token,
      body: { completed },
    }),
  explain: (source) => request('/assist/explain', { method: 'POST', body: { source } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, displayName, password) =>
    request('/auth/register', { method: 'POST', body: { email, displayName, password } }),
  me: (token) => request('/auth/me', { token }),
};
