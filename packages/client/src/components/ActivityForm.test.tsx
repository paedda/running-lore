import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ActivityData } from '@running-lore/shared';
import { ActivityForm } from './ActivityForm';

const emptyActivity: ActivityData = {
  raceName: '',
  date: '',
  distance: '',
  finishTime: '',
  averagePace: '',
  splits: '',
  heartRate: '',
  elevation: '',
  weather: '',
  course: '',
};

describe('ActivityForm', () => {
  it('renders all input fields', () => {
    render(<ActivityForm activity={emptyActivity} onChange={() => {}} />);
    expect(screen.getByLabelText(/race name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/distance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/finish time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/average pace/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/splits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/elevation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weather/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course notes/i)).toBeInTheDocument();
  });

  it('displays current activity values', () => {
    const activity: ActivityData = {
      ...emptyActivity,
      raceName: 'Colfax Marathon',
      distance: '26.2 miles',
    };
    render(<ActivityForm activity={activity} onChange={() => {}} />);
    expect(screen.getByLabelText(/race name/i)).toHaveAttribute('value', 'Colfax Marathon');
    expect(screen.getByLabelText(/distance/i)).toHaveAttribute('value', '26.2 miles');
  });

  it('calls onChange when a field is updated', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ActivityForm activity={emptyActivity} onChange={onChange} />);

    const input = screen.getByLabelText(/race name/i);
    await user.click(input);
    await user.keyboard('B');
    expect(onChange).toHaveBeenCalledWith({ ...emptyActivity, raceName: 'B' });
  });
});
