import { useRef, useState } from 'react';
import type { ActivityData } from '@running-lore/shared';
import { parseGpx } from '../utils/parseGpx';

interface ActivityFormProps {
  activity: ActivityData;
  onChange: (activity: ActivityData) => void;
}

export function ActivityForm({ activity, onChange }: ActivityFormProps) {
  const [gpxFile, setGpxFile] = useState<string | null>(null);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof ActivityData, value: string) => {
    onChange({ ...activity, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGpxError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseGpx(evt.target?.result as string);
        onChange({ ...activity, ...parsed });
        setGpxFile(file.name);
      } catch (err) {
        setGpxError(err instanceof Error ? err.message : 'Failed to parse GPX file');
        setGpxFile(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearGpx = () => {
    setGpxFile(null);
    setGpxError(null);
  };

  return (
    <div className="card">
      <h2 className="card-title">Activity Data</h2>

      <div className="gpx-upload">
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {gpxFile ? (
          <div className="gpx-success">
            <span className="gpx-filename">{gpxFile}</span>
            <button className="gpx-clear" onClick={clearGpx}>Clear</button>
          </div>
        ) : (
          <button className="gpx-trigger" onClick={() => fileInputRef.current?.click()}>
            Import GPX file
          </button>
        )}
        {gpxError && <p className="gpx-error">{gpxError}</p>}
      </div>
      <div className="form-grid">
        <div className="field full-width">
          <label htmlFor="raceName">Race Name</label>
          <input
            id="raceName"
            type="text"
            placeholder="e.g. 2025 Colfax Marathon"
            value={activity.raceName}
            onChange={(e) => update('raceName', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className={!activity.date ? 'date-empty' : ''}
            value={activity.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="distance">Distance</label>
          <input
            id="distance"
            type="text"
            placeholder="e.g. 26.2 miles, 10K"
            value={activity.distance}
            onChange={(e) => update('distance', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="finishTime">Finish Time</label>
          <input
            id="finishTime"
            type="text"
            placeholder="e.g. 3:42:15"
            value={activity.finishTime}
            onChange={(e) => update('finishTime', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="averagePace">Average Pace</label>
          <input
            id="averagePace"
            type="text"
            placeholder="e.g. 8:28/mi"
            value={activity.averagePace}
            onChange={(e) => update('averagePace', e.target.value)}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="splits">Splits (optional)</label>
          <textarea
            id="splits"
            rows={2}
            placeholder="e.g. Mile 1: 8:15, Mile 2: 8:22, Mile 3: 8:30..."
            value={activity.splits}
            onChange={(e) => update('splits', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="heartRate">Heart Rate (optional)</label>
          <input
            id="heartRate"
            type="text"
            placeholder="e.g. Avg 162, Max 178"
            value={activity.heartRate}
            onChange={(e) => update('heartRate', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="elevation">Elevation (optional)</label>
          <input
            id="elevation"
            type="text"
            placeholder="e.g. +1,200 ft"
            value={activity.elevation}
            onChange={(e) => update('elevation', e.target.value)}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="weather">Weather (optional)</label>
          <input
            id="weather"
            type="text"
            placeholder="e.g. 55°F, overcast, light wind"
            value={activity.weather}
            onChange={(e) => update('weather', e.target.value)}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="course">Course Notes (optional)</label>
          <input
            id="course"
            type="text"
            placeholder="e.g. Hilly first half, flat finish along the creek"
            value={activity.course}
            onChange={(e) => update('course', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
