/**
 * Min/max blind sizes, which depend on the selected opening direction.
 * All limits are defined in millimetres (the manufacturer's chart) and are
 * converted for display in inches / centimetres.
 */

export interface SizeLimitsMm {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

const MM_PER_INCH = 25.4;

// Allow for rounding noise when converting inches/cm back to mm.
const MM_TOLERANCE = 0.5;

const SIDE_OPENING_LIMITS: SizeLimitsMm = {
  minWidth: 200,
  maxWidth: 3500,
  minHeight: 250,
  maxHeight: 2000,
};

const TOP_DOWN_LIMITS: SizeLimitsMm = {
  minWidth: 250,
  maxWidth: 1500,
  minHeight: 200,
  maxHeight: 3500,
};

const SIZE_LIMITS_BY_DIRECTION: Record<string, SizeLimitsMm> = {
  'left-right': SIDE_OPENING_LIMITS,
  'right-left': SIDE_OPENING_LIMITS,
  split: SIDE_OPENING_LIMITS,
  'top-down': TOP_DOWN_LIMITS,
};

export function getSizeLimitsMm(openingDirection: string | null | undefined): SizeLimitsMm | null {
  if (!openingDirection) return null;
  return SIZE_LIMITS_BY_DIRECTION[openingDirection] ?? null;
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export type DisplayUnit = 'in' | 'cm';

export interface DisplayLimit {
  min: number;
  max: number;
  placeholder: string;
}

// Limits are shown as whole numbers, rounded inward so the displayed range never
// promises a size that is rejected (e.g. 200 mm = 7.87 in is shown as 8 in).
// Validation itself still uses the exact mm limits.
function toDisplayLimit(minMm: number, maxMm: number, unit: DisplayUnit): DisplayLimit {
  const divisor = unit === "cm" ? 10 : MM_PER_INCH;
  const min = Math.ceil(minMm / divisor - 1e-9);
  const max = Math.floor(maxMm / divisor + 1e-9);
  return { min, max, placeholder: `${min}-${max}` };
}

export function getDisplayLimits(limits: SizeLimitsMm, unit: DisplayUnit): { width: DisplayLimit; height: DisplayLimit } {
  return {
    width: toDisplayLimit(limits.minWidth, limits.maxWidth, unit),
    height: toDisplayLimit(limits.minHeight, limits.maxHeight, unit),
  };
}

export function formatDisplayLimit(limit: DisplayLimit, unit: DisplayUnit): string {
  return `${limit.placeholder} ${unit === "in" ? "in" : "cm"}`;
}

export function isWidthWithinLimits(widthInches: number, limits: SizeLimitsMm): boolean {
  const mm = inchesToMm(widthInches);
  return mm >= limits.minWidth - MM_TOLERANCE && mm <= limits.maxWidth + MM_TOLERANCE;
}

export function isHeightWithinLimits(heightInches: number, limits: SizeLimitsMm): boolean {
  const mm = inchesToMm(heightInches);
  return mm >= limits.minHeight - MM_TOLERANCE && mm <= limits.maxHeight + MM_TOLERANCE;
}

export function isSizeWithinLimits(widthInches: number, heightInches: number, limits: SizeLimitsMm): boolean {
  return isWidthWithinLimits(widthInches, limits) && isHeightWithinLimits(heightInches, limits);
}

export function buildSizeLimitMessage(limits: SizeLimitsMm, unit: DisplayUnit): string {
  const display = getDisplayLimits(limits, unit);
  return `Width must be ${formatDisplayLimit(display.width, unit)} and height ${formatDisplayLimit(display.height, unit)} for this opening direction.`;
}
