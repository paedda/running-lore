import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesEditor } from './NotesEditor';

describe('NotesEditor', () => {
  it('renders the input and add button', () => {
    render(<NotesEditor notes={[]} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/hit the wall/i)).toBeInTheDocument();
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('displays existing notes', () => {
    render(<NotesEditor notes={['Felt great', 'Bonked at mile 20']} onChange={() => {}} />);
    expect(screen.getByText('Felt great')).toBeInTheDocument();
    expect(screen.getByText('Bonked at mile 20')).toBeInTheDocument();
  });

  it('adds a note when clicking Add', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NotesEditor notes={[]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/hit the wall/i), 'New PR');
    await user.click(screen.getByText('+ Add'));

    expect(onChange).toHaveBeenCalledWith(['New PR']);
  });

  it('adds a note on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NotesEditor notes={[]} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/hit the wall/i), 'Cramped up{Enter}');

    expect(onChange).toHaveBeenCalledWith(['Cramped up']);
  });

  it('does not add empty notes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NotesEditor notes={[]} onChange={onChange} />);

    await user.click(screen.getByText('+ Add'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a note when clicking the remove button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NotesEditor notes={['Keep this', 'Remove this']} onChange={onChange} />);

    await user.click(screen.getByLabelText('Remove note: Remove this'));

    expect(onChange).toHaveBeenCalledWith(['Keep this']);
  });
});
