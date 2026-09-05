export type Rates = { TRY: number; USD: number; EUR: number };

export function convertAmount(amount: number, from: string, to: string, rates: Rates | null): number {
  if (!rates || from === to || !amount) return amount;
  const fromRate = from === "TRY" ? 1 : rates[from as "USD" | "EUR"];
  const toRate = to === "TRY" ? 1 : rates[to as "USD" | "EUR"];
  if (!fromRate || !toRate) return amount;
  return (amount * fromRate) / toRate;
}

export function toTRY(amount: number, currency: string, rates: Rates | null): number {
  return convertAmount(amount, currency, "TRY", rates);
}

// Uygulama genelinde tutarlar tutarlılık için TL'ye çevrilerek gösterilir;
// orijinal işlem para birimi veritabanında korunur, sadece ekran gösterimi TL'dir.
export function formatTRY(amount: number, currency: string, rates: Rates | null): string {
  return `₺${toTRY(amount, currency, rates).toFixed(2)}`;
}
