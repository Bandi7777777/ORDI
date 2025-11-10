export function calcPrices(techPrice: number, myMarginPct: number, companyMarginPct: number) {
  const myPrice = Math.round(techPrice * (1 + (myMarginPct || 0) / 100));  // round for currency
  const companyPrice = Math.round(myPrice * (1 + (companyMarginPct || 0) / 100));
  return { myPrice, companyPrice };
}

export function todayYMD() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const sum = (arr?: number[]) => (arr ?? []).reduce((a, b) => a + b, 0);