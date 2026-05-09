import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { reportRequestSchema } from '../validation';
import { generateReport } from '../services/reportGenerator';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = reportRequestSchema.parse(req.body);
    const result = await generateReport(validated);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
      return;
    }

    console.error('Report generation failed:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Generation failed: ${message}` });
  }
});

export default router;
