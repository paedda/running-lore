import { useState } from 'react';
import type { ActivityData, ReportImage, ReportTone } from '@running-lore/shared';
import { ActivityForm } from './components/ActivityForm';
import { NotesEditor } from './components/NotesEditor';
import { ToneSelector } from './components/ToneSelector';
import { ImageUploader } from './components/ImageUploader';
import { ReportOutput } from './components/ReportOutput';
import { useReport } from './hooks/useReport';
import './App.css';

const EMPTY_ACTIVITY: ActivityData = {
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

export function App() {
  const [activity, setActivity] = useState<ActivityData>(EMPTY_ACTIVITY);
  const [notes, setNotes] = useState<string[]>([]);
  const [tone, setTone] = useState<ReportTone>('storytelling');
  const [images, setImages] = useState<ReportImage[]>([]);
  const { generate, result, error, loading } = useReport();

  const handleGenerate = () => {
    if (!activity.raceName || !activity.distance || !activity.finishTime) {
      alert('Please fill in Race Name, Distance, and Finish Time.');
      return;
    }
    generate({ activity, notes, tone, images: images.length > 0 ? images : undefined });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Running Lore</h1>
        <p>Every race has a story. Even the ugly ones.</p>
      </header>

      <main className="container">
        <ActivityForm activity={activity} onChange={setActivity} />
        <NotesEditor notes={notes} onChange={setNotes} />
        <ToneSelector selected={tone} onChange={setTone} />
        <ImageUploader images={images} onChange={setImages} />

        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Crafting your race report...</p>
          </div>
        )}

        {error && (
          <div className="card">
            <div className="error-message">{error}</div>
          </div>
        )}

        {result && <ReportOutput result={result} />}
      </main>
    </div>
  );
}
