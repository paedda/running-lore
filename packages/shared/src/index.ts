export interface ActivityData {
  raceName: string;
  date: string;
  distance: string;
  finishTime: string;
  averagePace: string;
  splits?: string;
  heartRate?: string;
  elevation?: string;
  weather?: string;
  course?: string;
}

export type ReportTone = 'celebratory' | 'honest' | 'training-log' | 'storytelling';

export const REPORT_TONES: { value: ReportTone; label: string; description: string }[] = [
  { value: 'celebratory', label: 'Celebratory', description: 'Emphasize the highs and the achievement' },
  { value: 'honest', label: 'Honest', description: 'Real about what went well and what didn\'t' },
  { value: 'training-log', label: 'Training Log', description: 'Analytical, focused on data and lessons' },
  { value: 'storytelling', label: 'Storytelling', description: 'Full narrative arc with scene-setting' },
];

export interface ReportImage {
  data: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

export interface ReportRequest {
  activity: ActivityData;
  notes: string[];
  tone: ReportTone;
  images?: ReportImage[];
}

export interface ReportResponse {
  title: string;
  report: string;
}

export interface ApiError {
  error: string;
}
