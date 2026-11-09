/**
 * Currency utilities configured for Venezuela (Bolívares / VES / Bs.)
 */

export const CURRENCY_SYMBOL = 'Bs.';
export const CURRENCY_CODE = 'VES';
export const CURRENCY_NAME = 'Bolívares';

/**
 * Formats a numeric price into Venezuelan Bolívares (e.g., "Bs. 120", "Bs. 1.450")
 */
export function formatBs(amount: number | string | undefined | null): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `${CURRENCY_SYMBOL} ${numeric.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Simple format without forced decimals: "Bs. X"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `Bs. ${numeric.toLocaleString()}`;
}
