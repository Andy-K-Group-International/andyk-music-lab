export const CURRENCIES = ["GBP", "EUR", "USD", "BRL", "PYG"] as const;
export type Currency = (typeof CURRENCIES)[number];

const RATES: Record<Currency, number> = {
  GBP: 1,
  EUR: 1.20,
  USD: 1.27,
  BRL: 6.50,
  PYG: 950,
};

const SYMBOLS: Record<Currency, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
  BRL: "R$",
  PYG: "₲",
};

export function convert(gbp: number, currency: Currency): string {
  const amount = Math.round(gbp * RATES[currency]);
  const sym = SYMBOLS[currency];
  if (currency === "PYG") return `${sym}${amount.toLocaleString("en")}`;
  return `${sym}${amount}`;
}
