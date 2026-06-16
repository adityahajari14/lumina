export interface ComparePriceData {
  compareAtPrice: number;
  upliftPercent: number;
}

export function getComparePriceData(
  price: number,
  upliftPercent: number = 60
): ComparePriceData {
  const normalizedPercent = Math.max(1, upliftPercent);
  const compareAtPrice = Math.round((price / (1 - normalizedPercent / 100)) * 100) / 100;

  return {
    compareAtPrice,
    upliftPercent: normalizedPercent,
  };
}
