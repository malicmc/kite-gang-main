export type Rates = { TRY: number; USD: number; EUR: number };

export function convertAmount(amount: number, from: string, to: string, rates: Rates | null): number {
  if (!rates || from === to || !amount) return amount;
  const fromRate = from === "TRY" ? 1 : rates[from as "USD" | "EUR"];
  const toRate = to === "TRY" ? 1 : rates[to as "USD" | "EUR"];
  if (!fromRate || !toRate) return amount;
  return (amount * fromRate) / toRate;
}
