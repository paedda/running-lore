import { useState, useRef } from 'react';
import './NotesEditor.css';

interface NotesEditorProps {
  notes: string[];
  onChange: (notes: string[]) => void;
}

export function NotesEditor({ notes, onChange }: NotesEditorProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addNote = () => {
    const text = input.trim();
    if (!text) return;
    onChange([...notes, text]);
    setInput('');
    inputRef.current?.focus();
  };

  const removeNote = (index: number) => {
    onChange(notes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Your Notes</h2>
      <p className="notes-hint">
        Add bullet points about your experience. These personal details are what make the report yours.
      </p>

      {notes.length > 0 && (
        <ul className="notes-list">
          {notes.map((note, i) => (
            <li key={i}>
              <span className="bullet">•</span>
              <span className="note-text">{note}</span>
              <button
                className="note-remove"
                onClick={() => removeNote(i)}
                aria-label={`Remove note: ${note}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="note-input-row">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Hit the wall at mile 20 but pushed through"
        />
        <button className="btn-add" onClick={addNote}>
          + Add
        </button>
      </div>
    </div>
  );
}
