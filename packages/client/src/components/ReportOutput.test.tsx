import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportOutput } from './ReportOutput';

const mockResult = {
  title: 'My Marathon Story',
  report: '## The Start\n\nIt was a cold morning.\n\n**Bold move** to go out fast.',
};

describe('ReportOutput', () => {
  it('renders the report title', () => {
    render(<ReportOutput result={mockResult} />);
    expect(screen.getByText('My Marathon Story')).toBeInTheDocument();
  });

  it('renders markdown content', () => {
    render(<ReportOutput result={mockResult} />);
    expect(screen.getByText('The Start')).toBeInTheDocument();
    expect(screen.getByText('It was a cold morning.')).toBeInTheDocument();
  });

  it('renders the Copy Markdown button', () => {
    render(<ReportOutput result={mockResult} />);
    expect(screen.getByText('Copy Markdown')).toBeInTheDocument();
  });

  it('copies markdown to clipboard and shows confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ReportOutput result={mockResult} />);
    await user.click(screen.getByText('Copy Markdown'));

    expect(writeText).toHaveBeenCalledWith(
      `# My Marathon Story\n\n## The Start\n\nIt was a cold morning.\n\n**Bold move** to go out fast.`,
    );
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
