import { describe, it, expect } from 'vitest';
import type { ReportRequest } from '@running-lore/shared';
import { buildPrompt, parseResponse } from './reportGenerator';

const minimalRequest: ReportRequest = {
  activity: {
    raceName: '2025 Colfax Marathon',
    date: '2025-05-18',
    distance: '26.2 miles',
    finishTime: '3:42:15',
    averagePace: '8:28/mi',
  },
  notes: [],
  tone: 'storytelling',
};

const fullRequest: ReportRequest = {
  activity: {
    raceName: '2025 Colfax Marathon',
    date: '2025-05-18',
    distance: '26.2 miles',
    finishTime: '3:42:15',
    averagePace: '8:28/mi',
    splits: 'Mile 1: 8:15, Mile 2: 8:22',
    heartRate: 'Avg 162, Max 178',
    elevation: '+1,200 ft',
    weather: '55F, overcast',
    course: 'Hilly first half, flat finish',
  },
  notes: ['Went out too fast', 'New PR by 4 minutes'],
  tone: 'honest',
};

describe('buildPrompt', () => {
  it('includes all required activity fields', () => {
    const prompt = buildPrompt(minimalRequest);
    expect(prompt).toContain('**Race:** 2025 Colfax Marathon');
    expect(prompt).toContain('**Date:** 2025-05-18');
    expect(prompt).toContain('**Distance:** 26.2 miles');
    expect(prompt).toContain('**Finish Time:** 3:42:15');
    expect(prompt).toContain('**Average Pace:** 8:28/mi');
  });

  it('excludes optional fields when not provided', () => {
    const prompt = buildPrompt(minimalRequest);
    expect(prompt).not.toContain('**Splits:**');
    expect(prompt).not.toContain('**Heart Rate:**');
    expect(prompt).not.toContain('**Elevation:**');
    expect(prompt).not.toContain('**Weather:**');
    expect(prompt).not.toContain('**Course Notes:**');
    expect(prompt).not.toContain('Personal Notes');
  });

  it('includes optional fields when provided', () => {
    const prompt = buildPrompt(fullRequest);
    expect(prompt).toContain('**Splits:** Mile 1: 8:15, Mile 2: 8:22');
    expect(prompt).toContain('**Heart Rate:** Avg 162, Max 178');
    expect(prompt).toContain('**Elevation:** +1,200 ft');
    expect(prompt).toContain('**Weather:** 55F, overcast');
    expect(prompt).toContain('**Course Notes:** Hilly first half, flat finish');
  });

  it('includes notes as bullet points', () => {
    const prompt = buildPrompt(fullRequest);
    expect(prompt).toContain('**Personal Notes (weave these into the report):**');
    expect(prompt).toContain('- Went out too fast');
    expect(prompt).toContain('- New PR by 4 minutes');
  });

  it('includes tone and tone guide', () => {
    const prompt = buildPrompt(fullRequest);
    expect(prompt).toContain('**Tone:** honest');
    expect(prompt).toContain('Be real about what went well');
  });

  it('uses correct tone guide for each tone', () => {
    const tones = ['celebratory', 'honest', 'training-log', 'storytelling'] as const;
    const expectedSnippets = {
      celebratory: 'Emphasize the highs',
      honest: 'Be real about what went well',
      'training-log': 'More analytical',
      storytelling: 'Full narrative arc',
    };
    for (const tone of tones) {
      const prompt = buildPrompt({ ...minimalRequest, tone });
      expect(prompt).toContain(expectedSnippets[tone]);
    }
  });
});

describe('parseResponse', () => {
  it('extracts title from H1 heading', () => {
    const text = '# My Marathon Story\n\nIt was a great day.';
    const result = parseResponse(text);
    expect(result.title).toBe('My Marathon Story');
    expect(result.report).toBe('It was a great day.');
  });

  it('defaults title to "Race Report" when no H1 found', () => {
    const text = 'Just a report with no heading.';
    const result = parseResponse(text);
    expect(result.title).toBe('Race Report');
    expect(result.report).toBe('Just a report with no heading.');
  });

  it('strips the H1 line from the report body', () => {
    const text = '# Title Here\n\nParagraph one.\n\nParagraph two.';
    const result = parseResponse(text);
    expect(result.report).not.toContain('# Title Here');
    expect(result.report).toContain('Paragraph one.');
    expect(result.report).toContain('Paragraph two.');
  });

  it('handles H1 with extra whitespace', () => {
    const text = '#   Spaced Title  \n\nBody text.';
    const result = parseResponse(text);
    expect(result.title).toBe('Spaced Title  ');
    expect(result.report).toBe('Body text.');
  });

  it('does not treat ## as a title', () => {
    const text = '## Section Header\n\nSome content.';
    const result = parseResponse(text);
    expect(result.title).toBe('Race Report');
  });

  it('handles report with only a title', () => {
    const text = '# Just A Title';
    const result = parseResponse(text);
    expect(result.title).toBe('Just A Title');
    expect(result.report).toBe('');
  });
});
