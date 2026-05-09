import type { ActivityData } from '@running-lore/shared';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatPacePerMile(totalSeconds: number, totalMeters: number): string {
  const secondsPerMile = (totalSeconds / totalMeters) * 1609.34;
  const m = Math.floor(secondsPerMile / 60);
  const s = Math.floor(secondsPerMile % 60);
  return `${m}:${String(s).padStart(2, '0')}/mi`;
}

function formatDistance(miles: number): string {
  if (Math.abs(miles - 26.2) < 0.3) return '26.2 miles';
  if (Math.abs(miles - 13.1) < 0.2) return '13.1 miles';
  if (Math.abs(miles - 6.2) < 0.15) return '10K (6.2 miles)';
  if (Math.abs(miles - 3.1) < 0.1) return '5K (3.1 miles)';
  return `${Math.round(miles * 10) / 10} miles`;
}

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  time: Date;
  hr?: number;
}

export function parseGpx(xml: string): Partial<ActivityData> {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid GPX file');

  const nameEl = doc.querySelector('trk > name');
  const raceName = nameEl?.textContent?.trim() || undefined;

  const rawPoints = Array.from(doc.querySelectorAll('trkpt'));
  if (rawPoints.length < 2) throw new Error('GPX file contains no track data');

  const points: TrackPoint[] = rawPoints
    .map((pt) => {
      const lat = parseFloat(pt.getAttribute('lat') ?? '');
      const lon = parseFloat(pt.getAttribute('lon') ?? '');
      const ele = parseFloat(pt.querySelector('ele')?.textContent ?? '0');
      const time = new Date(pt.querySelector('time')?.textContent ?? '');
      const hrText = pt.querySelector('hr')?.textContent;
      const hr = hrText ? parseInt(hrText) : undefined;
      return { lat, lon, ele, time, hr };
    })
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lon) && !isNaN(p.time.getTime()));

  if (points.length < 2) throw new Error('GPX file has no valid timestamped points');

  // Distance and elevation
  let totalMeters = 0;
  let elevationGainM = 0;
  for (let i = 1; i < points.length; i++) {
    totalMeters += haversineDistance(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    const diff = points[i].ele - points[i - 1].ele;
    if (diff > 0) elevationGainM += diff;
  }

  // Elapsed time
  const startTime = points[0].time;
  const endTime = points[points.length - 1].time;
  const elapsedSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

  // Splits: find the trackpoint closest to each mile marker
  const splitLines: string[] = [];
  let cumulativeMeters = 0;
  let mileMarker = 1;
  let lastMileTime = startTime;

  for (let i = 1; i < points.length && mileMarker <= 50; i++) {
    cumulativeMeters += haversineDistance(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    if (cumulativeMeters >= mileMarker * 1609.34) {
      const splitSeconds = (points[i].time.getTime() - lastMileTime.getTime()) / 1000;
      splitLines.push(`Mile ${mileMarker}: ${formatDuration(splitSeconds)}`);
      lastMileTime = points[i].time;
      mileMarker++;
    }
  }

  // Heart rate
  const hrValues = points.map((p) => p.hr).filter((hr): hr is number => hr !== undefined && hr > 0);
  let heartRate: string | undefined;
  if (hrValues.length > 0) {
    const avg = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
    const max = Math.max(...hrValues);
    heartRate = `Avg ${avg}, Max ${max}`;
  }

  return {
    ...(raceName && { raceName }),
    date: startTime.toISOString().slice(0, 10),
    distance: formatDistance(totalMeters / 1609.34),
    finishTime: formatDuration(elapsedSeconds),
    averagePace: formatPacePerMile(elapsedSeconds, totalMeters),
    ...(splitLines.length > 0 && { splits: splitLines.join(', ') }),
    ...(heartRate && { heartRate }),
    elevation: `+${Math.round(elevationGainM * 3.281).toLocaleString()} ft`,
  };
}
