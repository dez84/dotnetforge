import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireUser } from '../middleware/auth.js';
import { ApiError } from '../middleware/errors.js';

export const progressRouter = Router();
progressRouter.use(requireUser);

// GET /api/progress — aggregate summary for the dashboard.
progressRouter.get('/', async (req, res, next) => {
  try {
    const { rows: totals } = await query(
      `SELECT COUNT(*)::int AS total_lessons FROM lessons`
    );
    const { rows: done } = await query(
      `SELECT COUNT(*)::int AS completed
       FROM lesson_progress WHERE user_id = $1 AND status = 'completed'`,
      [req.user.id]
    );
    const { rows: byTrack } = await query(
      `SELECT t.slug, t.title, t.accent,
              COUNT(l.id)::int AS total,
              COUNT(lp.id) FILTER (WHERE lp.status = 'completed')::int AS completed
       FROM tracks t
       LEFT JOIN modules m ON m.track_id = t.id
       LEFT JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp
              ON lp.lesson_id = l.id AND lp.user_id = $1
       WHERE t.is_capstone = FALSE
       GROUP BY t.id
       ORDER BY t.sort_order`,
      [req.user.id]
    );
    const { rows: capstone } = await query(
      `SELECT COUNT(*)::int AS total,
              COUNT(cp.id) FILTER (WHERE cp.completed)::int AS completed
       FROM capstone_steps s
       LEFT JOIN capstone_progress cp
              ON cp.step_id = s.id AND cp.user_id = $1`,
      [req.user.id]
    );
    const { rows: completedSteps } = await query(
      `SELECT step_id FROM capstone_progress
       WHERE user_id = $1 AND completed = TRUE`,
      [req.user.id]
    );
    const { rows: completedLessons } = await query(
      `SELECT lesson_id FROM lesson_progress
       WHERE user_id = $1 AND status = 'completed'`,
      [req.user.id]
    );

    res.json({
      lessonsTotal: totals[0].total_lessons,
      lessonsCompleted: done[0].completed,
      byTrack,
      capstone: capstone[0],
      completedStepIds: completedSteps.map((r) => r.step_id),
      completedLessonIds: completedLessons.map((r) => r.lesson_id),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/lessons/:lessonId  { status, score? }
progressRouter.post('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { status = 'completed', score = null } = req.body || {};
    if (!Number.isInteger(lessonId)) throw new ApiError(400, 'Invalid lesson id');
    if (!['in_progress', 'completed'].includes(status)) {
      throw new ApiError(400, 'status must be in_progress or completed');
    }

    const { rows } = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, score, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $3 = 'completed' THEN now() ELSE NULL END, now())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET status = EXCLUDED.status,
                     score = EXCLUDED.score,
                     completed_at = EXCLUDED.completed_at,
                     updated_at = now()
       RETURNING lesson_id, status, score, completed_at`,
      [req.user.id, lessonId, status, score]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/progress/capstone-steps/:stepId  { completed }
progressRouter.post('/capstone-steps/:stepId', async (req, res, next) => {
  try {
    const stepId = Number(req.params.stepId);
    const completed = Boolean(req.body?.completed);
    if (!Number.isInteger(stepId)) throw new ApiError(400, 'Invalid step id');

    const { rows } = await query(
      `INSERT INTO capstone_progress (user_id, step_id, completed, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id, step_id)
       DO UPDATE SET completed = EXCLUDED.completed, updated_at = now()
       RETURNING step_id, completed, updated_at`,
      [req.user.id, stepId, completed]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
