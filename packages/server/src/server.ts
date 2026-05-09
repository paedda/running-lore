import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import reportRouter from './routes/report';

dotenv.config({ path: '../../.env' });

// Fail fast if required env vars are missing
const REQUIRED_ENV = ['ANTHROPIC_API_KEY'] as const;
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[running-lore] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[running-lore] Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Too many requests, please wait a minute and try again.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.use('/api/report', reportLimiter, reportRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', api: 'POST /api/report/generate' });
});

const server = app.listen(PORT, () => {
  console.log(`[running-lore] API running at http://localhost:${PORT}`);
  console.log(`[running-lore] Accepting requests from ${CLIENT_URL}`);
});

// Graceful shutdown: stop accepting new connections, wait for in-flight requests to finish
function shutdown(signal: string) {
  console.log(`[running-lore] ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('[running-lore] Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
