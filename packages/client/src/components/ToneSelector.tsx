import { REPORT_TONES, type ReportTone } from '@running-lore/shared';
import './ToneSelector.css';

interface ToneSelectorProps {
  selected: ReportTone;
  onChange: (tone: ReportTone) => void;
}

export function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="card">
      <h2 className="card-title">Tone</h2>
      <div className="tone-options">
        {REPORT_TONES.map((tone) => (
          <button
            key={tone.value}
            className={`tone-option ${selected === tone.value ? 'active' : ''}`}
            onClick={() => onChange(tone.value)}
            title={tone.description}
          >
            {tone.label}
          </button>
        ))}
      </div>
    </div>
  );
}
