import type { PriceOption } from '@/types';

// Keep the blackout storefront aligned with the same EclipseCore customization
// labels and option IDs used in Yournextblinds for this product.
export const BLIND_COLOR_OPTIONS: PriceOption[] = [
  {
    id: 'white',
    name: 'White',
    price: 0,
    hex: '#f2efe9',
  },
  {
    id: 'cream',
    name: 'Cream',
    price: 0,
    hex: '#b8afa6',
  },
  {
    id: 'anthracite',
    name: 'Anthracite',
    price: 0,
    hex: '#2c2925',
  },
];

export const FRAME_COLOR_OPTIONS: PriceOption[] = [
  {
    id: 'white',
    name: 'White',
    price: 0,
    hex: '#f5f2ee',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    price: 0,
    hex: '#4a4845',
  },
];

export const OPENING_DIRECTION_OPTIONS: PriceOption[] = [
  {
    id: 'left-right',
    name: 'Left & Right',
    price: 0,
  },
  {
    id: 'up-down',
    name: 'Up & Down',
    price: 0,
  },
];

function buildLabelMap(options: PriceOption[]): Record<string, string> {
  return Object.fromEntries(options.map((option) => [option.id, option.name]));
}

export const BLIND_COLOR_LABELS = buildLabelMap(BLIND_COLOR_OPTIONS);
export const FRAME_COLOR_LABELS = buildLabelMap(FRAME_COLOR_OPTIONS);
export const OPENING_DIRECTION_LABELS = buildLabelMap(OPENING_DIRECTION_OPTIONS);
