import Anthropic from '@anthropic-ai/sdk';
import type { ReportRequest, ReportResponse, ReportTone } from '@running-lore/shared';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a race report writer for running blogs. You write vivid, personal race reports that capture what it actually feels like to run a race.

Your style:
- Write in first person
- Be conversational and authentic, not generic or cliché
- Include specific details from the data and notes provided
- Structure with a natural narrative arc: pre-race, the race itself (with mile/km breakdowns when splits are provided), and post-race reflection
- Reference pace, heart rate, and elevation when the data is available, but weave it into the story naturally
- Never use em dashes
- Keep paragraphs short and punchy for blog readability
- Use markdown formatting (## for section headers, **bold** for emphasis)

Output format:
Return the report as markdown. Start with the title as an H1 (# Title), then the report body.`;

const TONE_GUIDES: Record<ReportTone, string> = {
  celebratory: 'This was a great race. Emphasize the highs, the achievement, and the joy of crossing the finish line.',
  honest: 'Be real about what went well and what didn\'t. Include the struggle, the doubt, and the lessons.',
  'training-log': 'More analytical. Focus on the data, what training worked, pacing strategy, and what to adjust next cycle.',
  storytelling: 'Full narrative arc. Set the scene, build tension through the middle miles, deliver the payoff at the finish.',
};

export function buildPrompt(request: ReportRequest): string {
  const { activity, notes, tone } = request;

  const lines: string[] = [
    'Generate a race report with the following details:\n',
    `**Race:** ${activity.raceName}`,
    `**Date:** ${activity.date}`,
    `**Distance:** ${activity.distance}`,
    `**Finish Time:** ${activity.finishTime}`,
    `**Average Pace:** ${activity.averagePace}`,
  ];

  if (activity.splits) lines.push(`**Splits:** ${activity.splits}`);
  if (activity.heartRate) lines.push(`**Heart Rate:** ${activity.heartRate}`);
  if (activity.elevation) lines.push(`**Elevation:** ${activity.elevation}`);
  if (activity.weather) lines.push(`**Weather:** ${activity.weather}`);
  if (activity.course) lines.push(`**Course Notes:** ${activity.course}`);

  if (notes.length > 0) {
    lines.push('\n**Personal Notes (weave these into the report):**');
    notes.forEach((note) => lines.push(`- ${note}`));
  }

  lines.push(`\n**Tone:** ${tone}`);
  lines.push(TONE_GUIDES[tone]);

  return lines.join('\n');
}

export function parseResponse(text: string): ReportResponse {
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Race Report';
  const report = titleMatch ? text.replace(/^#\s+.+\n*/, '').trim() : text;
  return { title, report };
}

export async function generateReport(request: ReportRequest): Promise<ReportResponse> {
  const { images } = request;

  const userContent: Anthropic.MessageParam['content'] = [];

  if (images && images.length > 0) {
    for (const img of images) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType,
          data: img.data,
        },
      });
    }
    userContent.push({
      type: 'text',
      text: `The runner has shared ${images.length} race photo${images.length > 1 ? 's' : ''} above. Reference what you can observe in them naturally within the report.\n\n${buildPrompt(request)}`,
    });
  } else {
    userContent.push({ type: 'text', text: buildPrompt(request) });
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in response');
  }

  return parseResponse(textBlock.text);
}
