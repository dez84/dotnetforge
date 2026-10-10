import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { contentRouter } from './routes/content.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { assistRouter } from './routes/assist.js';
import { attachUser } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { query } from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`DotNetForge API listening on http://localhost:${PORT}`);
});
