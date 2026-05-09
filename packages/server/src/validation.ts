import { z } from 'zod';

const stripTags = (s: string) => s.replace(/<[^>]*>/g, '');

const sanitized = (max: number, label: string) =>
  z.string().trim()
    .transform(stripTags)
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer`));

const sanitizedRequired = (max: number, label: string) =>
  z.string().trim()
    .transform(stripTags)
    .pipe(z.string().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`));

export const activitySchema = z.object({
  raceName:    sanitizedRequired(200, 'Race name'),
  date:        z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  distance:    sanitizedRequired(100, 'Distance'),
  finishTime:  sanitizedRequired(20, 'Finish time'),
  averagePace: sanitizedRequired(30, 'Average pace'),
  splits:      sanitized(2000, 'Splits').optional().default(''),
  heartRate:   sanitized(100, 'Heart rate').optional().default(''),
  elevation:   sanitized(100, 'Elevation').optional().default(''),
  weather:     sanitized(300, 'Weather').optional().default(''),
  course:      sanitized(500, 'Course notes').optional().default(''),
});

const reportImageSchema = z.object({
  data: z.string().min(1).max(10_000_000, 'Image data too large'),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
});

export const reportRequestSchema = z.object({
  activity: activitySchema,
  notes: z
    .array(
      z.string().trim()
        .transform(stripTags)
        .pipe(z.string().min(1).max(500, 'Each note must be 500 characters or fewer'))
    )
    .max(30, 'Maximum 30 notes allowed')
    .default([]),
  tone: z.enum(['celebratory', 'honest', 'training-log', 'storytelling']).default('storytelling'),
  images: z.array(reportImageSchema).max(5, 'Maximum 5 images allowed').optional(),
});

export type ValidatedReportRequest = z.infer<typeof reportRequestSchema>;
