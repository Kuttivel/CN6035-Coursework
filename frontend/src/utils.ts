export function formatNumber(num: number | string): string {
  return parseFloat(Number(num).toFixed(3)).toString();
}