import { Router } from 'express';
import { query } from '../db/pool.js';
import { ApiError } from '../middleware/errors.js';

export const contentRouter = Router();

// GET /api/tracks — all tracks with module + lesson counts.
contentRouter.get('/tracks', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT t.id, t.slug, t.title, t.subtitle, t.description, t.icon,
             t.accent, t.sort_order, t.is_capstone,
             COUNT(DISTINCT m.id)::int AS module_count,
             COUNT(l.id)::int           AS lesson_count
      FROM tracks t
      LEFT JOIN modules m ON m.track_id = t.id
      LEFT JOIN lessons l ON l.module_id = m.id
      GROUP BY t.id
      ORDER BY t.sort_order
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/tracks/:slug — track with nested modules, lessons, quiz ids.
contentRouter.get('/tracks/:slug', async (req, res, next) => {
  try {
    const { rows: tracks } = await query(
      `SELECT * FROM tracks WHERE slug = $1`,
      [req.params.slug]
    );
    if (!tracks.length) throw new ApiError(404, 'Track not found', 'Not Found');
    const track = tracks[0];

    const { rows: modules } = await query(
      `SELECT id, slug, title, summary, sort_order
       FROM modules WHERE track_id = $1 ORDER BY sort_order`,
      [track.id]
    );

    const moduleIds = modules.map((m) => m.id);
    let lessons = [];
    if (moduleIds.length) {
      const { rows } = await query(
        `SELECT l.id, l.module_id, l.slug, l.title, l.est_minutes, l.sort_order,
                (SELECT COUNT(*)::int FROM quiz_questions q WHERE q.lesson_id = l.id) AS quiz_count
         FROM lessons l
         WHERE l.module_id = ANY($1::int[])
         ORDER BY l.sort_order`,
        [moduleIds]
      );
      lessons = rows;
    }

    for (const m of modules) {
      m.lessons = lessons.filter((l) => l.module_id === m.id);
    }

    res.json({ ...track, modules });
  } catch (err) {
    next(err);
  }
});

// GET /api/lessons/:id — a single lesson with content blocks and quiz.
contentRouter.get('/lessons/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError(400, 'Invalid lesson id');

    const { rows } = await query(
      `SELECT l.*, m.slug AS module_slug, m.title AS module_title,
              t.slug AS track_slug, t.title AS track_title, t.accent AS track_accent
       FROM lessons l
       JOIN modules m ON m.id = l.module_id
       JOIN tracks  t ON t.id = m.track_id
       WHERE l.id = $1`,
      [id]
    );
    if (!rows.length) throw new ApiError(404, 'Lesson not found', 'Not Found');

    const { rows: quiz } = await query(
      `SELECT id, prompt, options, explanation, sort_order
       FROM quiz_questions WHERE lesson_id = $1 ORDER BY sort_order`,
      [id]
    );

    // Never leak correct answers to the client.
    const lesson = rows[0];
    res.json({ ...lesson, quiz });
  } catch (err) {
    next(err);
  }
});

// POST /api/lessons/:id/answer — grade a quiz answer for a question.
contentRouter.post('/lessons/:id/answer', async (req, res, next) => {
  try {
    const lessonId = Number(req.params.id);
    const { questionId, optionId } = req.body || {};
    if (!Number.isInteger(lessonId) || !questionId || !optionId) {
      throw new ApiError(400, 'questionId and optionId are required');
    }

    const { rows } = await query(
      `SELECT correct_id, explanation FROM quiz_questions
       WHERE id = $1 AND lesson_id = $2`,
      [questionId, lessonId]
    );
    if (!rows.length) throw new ApiError(404, 'Question not found', 'Not Found');

    const correct = rows[0].correct_id === optionId;
    res.json({
      correct,
      correctId: rows[0].correct_id,
      explanation: rows[0].explanation,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/capstones — the four guided projects.
contentRouter.get('/capstones', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT p.*, COUNT(s.id)::int AS step_count
      FROM capstone_projects p
      LEFT JOIN capstone_steps s ON s.project_id = p.id
      GROUP BY p.id
      ORDER BY p.sort_order
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/capstones/:slug — one project with its ordered steps.
contentRouter.get('/capstones/:slug', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM capstone_projects WHERE slug = $1`,
      [req.params.slug]
    );
    if (!rows.length) throw new ApiError(404, 'Capstone not found', 'Not Found');

    const { rows: steps } = await query(
      `SELECT id, slug, title, body, commands, code, code_language, sort_order
       FROM capstone_steps WHERE project_id = $1 ORDER BY sort_order`,
      [rows[0].id]
    );
    res.json({ ...rows[0], steps });
  } catch (err) {
    next(err);
  }
});
