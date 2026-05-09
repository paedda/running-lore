import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { reportRequestSchema } from '../validation';
import { streamReport } from '../services/reportGenerator';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  let validated;
  try {
    validated = reportRequestSchema.parse(req.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
      return;
    }
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    await streamReport(validated, (chunk) => res.write(chunk));
    res.end();
  } catch (error) {
    console.error('Report generation failed:', error);
    res.end();
  }
});

export default router;
