const LATITUDE = 37.0378;
const LONGITUDE = 28.3297;

export type WindConditions = {
  temperature: number;
  windSpeedKn: number;
  windGustKn: number;
  windDirectionDeg: number;
  windDirectionLabel: string;
  updatedAt: string;
};

const DIRECTION_LABELS = ["K", "KKD", "KD", "DKD", "D", "DGD", "GD", "GGD", "G", "GGB", "GB", "BGB", "B", "BKB", "KB", "KKB"];

function directionLabel(deg: number): string {
  const index = Math.round(deg / 22.5) % 16;
  return DIRECTION_LABELS[index];
}

let cache: WindConditions | null = null;
let cacheAt = 0;
const CACHE_MS = 15 * 60 * 1000;

export async function getWindConditions(): Promise<WindConditions | null> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) {
    return cache;
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kn&timezone=auto`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return cache;

    const data = await res.json();
    const c = data?.current;
    if (!c) return cache;

    const result: WindConditions = {
      temperature: c.temperature_2m,
      windSpeedKn: c.wind_speed_10m,
      windGustKn: c.wind_gusts_10m,
      windDirectionDeg: c.wind_direction_10m,
      windDirectionLabel: directionLabel(c.wind_direction_10m),
      updatedAt: new Date().toISOString(),
    };
    cache = result;
    cacheAt = now;
    return result;
  } catch {
    return cache;
  }
}
