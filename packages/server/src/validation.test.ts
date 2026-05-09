import { describe, it, expect } from 'vitest';
import { activitySchema, reportRequestSchema } from './validation';

const validActivity = {
  raceName: '2025 Colfax Marathon',
  date: '2025-05-18',
  distance: '26.2 miles',
  finishTime: '3:42:15',
  averagePace: '8:28/mi',
};

describe('activitySchema', () => {
  it('accepts valid activity with required fields only', () => {
    const result = activitySchema.parse(validActivity);
    expect(result.raceName).toBe('2025 Colfax Marathon');
    expect(result.splits).toBe('');
    expect(result.heartRate).toBe('');
    expect(result.elevation).toBe('');
    expect(result.weather).toBe('');
    expect(result.course).toBe('');
  });

  it('accepts valid activity with all optional fields', () => {
    const full = {
      ...validActivity,
      splits: 'Mile 1: 8:15, Mile 2: 8:22',
      heartRate: 'Avg 162, Max 178',
      elevation: '+1,200 ft',
      weather: '55F, overcast',
      course: 'Hilly first half',
    };
    const result = activitySchema.parse(full);
    expect(result.splits).toBe('Mile 1: 8:15, Mile 2: 8:22');
    expect(result.weather).toBe('55F, overcast');
  });

  it('rejects missing raceName', () => {
    const { raceName, ...rest } = validActivity;
    expect(() => activitySchema.parse(rest)).toThrow();
  });

  it('rejects empty raceName', () => {
    expect(() => activitySchema.parse({ ...validActivity, raceName: '' })).toThrow();
  });

  it('rejects missing distance', () => {
    const { distance, ...rest } = validActivity;
    expect(() => activitySchema.parse(rest)).toThrow();
  });

  it('rejects missing finishTime', () => {
    const { finishTime, ...rest } = validActivity;
    expect(() => activitySchema.parse(rest)).toThrow();
  });

  it('rejects missing date', () => {
    const { date, ...rest } = validActivity;
    expect(() => activitySchema.parse(rest)).toThrow();
  });

  it('rejects missing averagePace', () => {
    const { averagePace, ...rest } = validActivity;
    expect(() => activitySchema.parse(rest)).toThrow();
  });
});

describe('reportRequestSchema', () => {
  it('accepts valid request with defaults', () => {
    const result = reportRequestSchema.parse({ activity: validActivity });
    expect(result.notes).toEqual([]);
    expect(result.tone).toBe('storytelling');
  });

  it('accepts all tone values', () => {
    for (const tone of ['celebratory', 'honest', 'training-log', 'storytelling'] as const) {
      const result = reportRequestSchema.parse({ activity: validActivity, tone });
      expect(result.tone).toBe(tone);
    }
  });

  it('rejects invalid tone', () => {
    expect(() =>
      reportRequestSchema.parse({ activity: validActivity, tone: 'sarcastic' }),
    ).toThrow();
  });

  it('accepts notes array', () => {
    const result = reportRequestSchema.parse({
      activity: validActivity,
      notes: ['Hit the wall at mile 20', 'New PR'],
    });
    expect(result.notes).toEqual(['Hit the wall at mile 20', 'New PR']);
  });

  it('rejects when activity is missing entirely', () => {
    expect(() => reportRequestSchema.parse({})).toThrow();
  });

  it('rejects when activity has invalid fields', () => {
    expect(() =>
      reportRequestSchema.parse({ activity: { raceName: '' } }),
    ).toThrow();
  });
});
