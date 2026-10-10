import express from 'express';
import cors from 'cors';

import { contentRouter } from './routes/content.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { assistRouter } from './routes/assist.js';
import { attachUser } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { query } from './db/pool.js';

// Builds the Express app. Kept separate from the listener so tests can create
// the app without binding a port.
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '256kb' }));
  app.use(attachUser);

  app.get('/api/health', async (_req, res) => {
    try {
      await query('SELECT 1');
      res.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: 'degraded', db: 'down' });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/assist', assistRouter);
  app.use('/api', contentRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
