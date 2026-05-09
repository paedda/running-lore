import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToneSelector } from './ToneSelector';

describe('ToneSelector', () => {
  it('renders all four tone options', () => {
    render(<ToneSelector selected="storytelling" onChange={() => {}} />);
    expect(screen.getByText('Celebratory')).toBeInTheDocument();
    expect(screen.getByText('Honest')).toBeInTheDocument();
    expect(screen.getByText('Training Log')).toBeInTheDocument();
    expect(screen.getByText('Storytelling')).toBeInTheDocument();
  });

  it('marks the selected tone as active', () => {
    render(<ToneSelector selected="honest" onChange={() => {}} />);
    expect(screen.getByText('Honest')).toHaveClass('active');
    expect(screen.getByText('Celebratory')).not.toHaveClass('active');
  });

  it('calls onChange when a tone is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToneSelector selected="storytelling" onChange={onChange} />);

    await user.click(screen.getByText('Celebratory'));
    expect(onChange).toHaveBeenCalledWith('celebratory');
  });
});
