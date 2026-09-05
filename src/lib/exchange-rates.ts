import "server-only";

export type ExchangeRates = { TRY: 1; USD: number; EUR: number; updatedAt: string };

let cache: ExchangeRates | null = null;
let cacheAt = 0;
const CACHE_MS = 60 * 60 * 1000;

async function fetchRate(from: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=TRY`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.rates?.TRY ?? null;
  } catch {
    return null;
  }
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) return cache;

  const [usd, eur] = await Promise.all([fetchRate("USD"), fetchRate("EUR")]);

  if (usd === null && eur === null && cache) {
    // Fetch failed — serve stale cache rather than nothing
    return cache;
  }

  const result: ExchangeRates = {
    TRY: 1,
    USD: usd ?? cache?.USD ?? 0,
    EUR: eur ?? cache?.EUR ?? 0,
    updatedAt: new Date().toISOString(),
  };
  cache = result;
  cacheAt = now;

  return result;
}
